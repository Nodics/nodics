const App = ({ name }) => {
  return (
    <h1>Hello {name}</h1>
  );
};
ReactDOM.render(<App name="World" />, document.getElementById("App"));