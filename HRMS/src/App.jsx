import "./App.css";
import {
  useEffect,
} from "react";
import {
  useDispatch,
  useSelector,
} from "react-redux";
import AppRoutes from "./routes/AppRoutes";
import {
  getProfile,
} from "./redux/auth/authThunk";


function App() {
  const dispatch =
    useDispatch();
  const {
    token,
    initialized,
  } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (
      token &&
      !initialized
    ) {
      dispatch(
        getProfile()
      );
    }
  }, [
    dispatch,
    token,
    initialized,
  ]);

  return <AppRoutes />;
}

export default App;
