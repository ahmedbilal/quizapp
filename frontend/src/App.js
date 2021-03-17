import QuizDetail from "./QuizDetail.js";
import Home from "./Home.js";
import Navbar from "./Navbar.js";
import QuestionDetail from "./QuestionDetail.js";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import QuizResult from "./QuizResult.js";
import Signup from "./Signup.js";
import Login from "./Login.js";
import PrivateRoute from "./PrivateRoute.js";
import Logout from "./Logout.js";

export default function App() {
  return (
      <BrowserRouter>
        <Navbar />
        <Switch>
          <Route path="/quizzes/:quizID">
            <QuizDetail />
          </Route>
          <PrivateRoute path="/questions/:questionID">
            <QuestionDetail />
          </PrivateRoute>
          <Route path="/result/:quizInstanceID">
            <QuizResult />
          </Route>
          <PrivateRoute path="/accounts/logout">
            <Logout />
          </PrivateRoute>
          <Route path="/accounts/signup">
            <Signup />
          </Route>
          <Route path="/accounts/login">
            <Login />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </BrowserRouter>
  );
}
