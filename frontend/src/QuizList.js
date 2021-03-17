import React from "react";
import { Link, withRouter } from "react-router-dom";

class QuizList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            quizList: []
        };
    }
    componentDidMount() {
        fetch(`${process.env.REACT_APP_API_URL}/quizzes/`).then(response => response.json()).then(quizList => this.setState({quizList: quizList}))
    }
    render(){
        const quizList = this.state.quizList.map(quiz => <li key={quiz.id.toString()}><Link to={`quizzes/${quiz.id}`} className="text-blue-500 text-xl underline hover:text-blue-700">{quiz.title}</Link></li>);

        return (
            <div className="p-3">
                <ul>
                    {quizList}
                </ul>
            </div>

        );
    }
}

export default withRouter(QuizList);