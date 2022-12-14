import "./index.css";
import { Link } from "react-router-dom";

function App() {
  return (
    <div className="App w-screen h-screen flex items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center">
        <span className="font-semibold text-lg text-purple-900 mb-2">Yeah</span>
        <Link className="font-semibold text-md text-purple-700" to={"/test1"}>
          link?
        </Link>
      </div>
    </div>
  );
}

export default App;
