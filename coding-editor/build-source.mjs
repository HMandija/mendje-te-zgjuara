import webpack from 'webpack';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {cpSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {library} from './library.mjs';
import {prepareLibrary,assetDirectory} from './prepare-library.mjs';
import themeColors from './theme-colors.cjs';
const require=createRequire(import.meta.url);
const root=fileURLToPath(new URL('.',import.meta.url));
const modules=resolve(root,'node_modules'),out=resolve(modules,'.lab-source-build');
const aliases={};
for(const [name,entry] of [['scratch-gui','index.ts'],['scratch-vm','index.js'],['scratch-render','index.js'],['scratch-paint','index.js'],['scratch-storage','index.ts'],['scratch-svg-renderer','index.js']])aliases[`@scratch/${name}$`]=resolve(modules,`@scratch/${name}/src/${entry}`);
aliases['hull.js$']=resolve(root,'safe-hull/index.cjs');
const config={
 mode:'production',context:root,target:'web',devtool:false,
 entry:resolve(root,'source-entry.mjs'),
 output:{path:out,filename:'lab-gui.js',chunkFilename:'chunks/[name].[contenthash].js',publicPath:'auto',library:{name:'GUI',type:'umd'},globalObject:'self',clean:true},
 externals:{react:'react','react-dom':'react-dom','react-redux':'react-redux',redux:'redux'},
 resolve:{extensions:['.ts','.tsx','.js','.jsx','.mjs','.json'],conditionNames:['webpack','browser','import','default'],alias:aliases,fallback:{fs:false,path:false,crypto:false,stream:false}},
 resolveLoader:{modules:[modules],alias:{'raw-loader':resolve(root,'text-loader.cjs')}},
 module:{rules:[
  {test:/\.(jsx?|tsx?|mjs|cjs|json)$/,enforce:'pre',include:modules,use:resolve(root,'source-loader.cjs')},
  {resourceQuery:/^\?resource$/,type:'asset/resource',generator:{filename:'static/[contenthash][ext]'}},
  {resourceQuery:/^\?source$/,type:'asset/source'},
  {test:/\.[jt]sx?$/,resourceQuery:{not:[/^\?(resource|source)$/]},include:resolve(modules,'@scratch'),use:{loader:'babel-loader',options:{babelrc:false,configFile:false,presets:[[require.resolve('@babel/preset-env'),{targets:{chrome:'110'}}],[require.resolve('@babel/preset-react'),{runtime:'classic'}],[require.resolve('@babel/preset-typescript'),{allExtensions:true,isTSX:true}]]}}},
  {test:/\.css$/,use:['style-loader',{loader:'css-loader',options:{importLoaders:1,modules:{localIdentName:'lab_[local]_[hash:base64:5]',exportLocalsConvention:'camelCase'}}},{loader:'postcss-loader',options:{postcssOptions:{plugins:[require('postcss-import')({load:file=>themeColors(file,readFileSync(file,'utf8'))}),require('postcss-simple-vars')()]}}}]},
  {test:/\.(svg|png|jpe?g|gif|wav|mp3|ogg|hex|ttf|woff2?)$/,exclude:resolve(modules,'scratch-render-fonts'),type:'asset/resource',generator:{filename:'static/[contenthash][ext]'}},
 ]},
 plugins:[new webpack.ProvidePlugin({Buffer:['buffer','Buffer'],process:'process/browser'}),new webpack.DefinePlugin({'process.env.NODE_ENV':JSON.stringify('production'),'process.env.DEBUG':JSON.stringify(false)})],
 optimization:{minimize:true},performance:{hints:false},stats:'errors-warnings'
};
mkdirSync(out,{recursive:true});
await prepareLibrary();
writeFileSync(resolve(modules,'.lab-library.json'),JSON.stringify(library));
await new Promise((resolvePromise,reject)=>{
 webpack(config,(error,stats)=>{
  if(error)return reject(error);
  const result=stats.toJson({all:false,errors:true,warnings:true,modules:true,nestedModules:true});
  if(stats.hasErrors())return reject(new Error(JSON.stringify(result.errors,null,2)));
  const names=[];
  const visit=items=>{for(const item of items||[]){if(item.name)names.push(item.name);visit(item.modules);}};visit(result.modules);
  if(names.some(name=>/hull\.js[\\/]src|@scratch[\\/](scratch-svg-renderer|scratch-storage|scratch-gui|scratch-vm|scratch-render|scratch-paint)[\\/]dist/.test(name)))return reject(new Error('An upstream precompiled or vulnerable module was included.'));
  cpSync(resolve(modules,'scratch-blocks/media'),resolve(out,'static/blocks-media/default'),{recursive:true});
  cpSync(assetDirectory,resolve(out,'library-assets'),{recursive:true});
  writeFileSync(resolve(out,'source-modules.json'),JSON.stringify(names.sort(),null,2));
  process.stdout.write(stats.toString({colors:false,all:false,errors:true,warnings:true})+'\n');
  resolvePromise();
 });
});
