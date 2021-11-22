module.exports = {
  entry: "./main.js",
  module: {
    rules: [
      {
        test: /\.js$/,
        use:{
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"], // 将js转换成旧版本
            plugins: [["@babel/plugin-transform-react-jsx", {pragma: "createElement"}]] // 对 jsx 的支持, pragma - 配置方法名
          }
        }
      }
    ]
  },
  mode: "development"
}