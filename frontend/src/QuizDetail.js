import React from "react";
import { connect } from "react-redux";
import { CHANGE_QUIZ } from "./actionTypes";
import QuestionList from "./QuestionList";
import { withRouter } from "react-router-dom";

class QuizDetail extends React.Component {
    constructor(props) {
        super(props);
        this.quizID = this.props.match.params.quizID

        this.state = {
            quiz: undefined,
            error: false,
        }
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    componentDidMount() {
        fetch(`${process.env.REACT_APP_API_URL}/quizzes/${this.quizID}/`)
        .then(response => response.json())
        .then(
            (quiz) => {
                this.setState({ quiz: quiz });
            },
            (error) => {
                this.setState({ error: true });
            }
        );
    }
    handleSubmit(event) {
        event.preventDefault();
        let formData = new FormData();
        formData.append("quiz", this.quizID)
        fetch(`${process.env.REACT_APP_API_URL}/quizinstances/`, {
            method: "POST",
            headers: {
                'Authorization': `Token ${this.props.token}`,
            },
            body: formData
        }).then(response => response.json()).then(json => {
            this.props.dispatch({type: CHANGE_QUIZ, quiz_instance: json.id});
            this.props.history.push(`/questions/${this.state.quiz.questions[0].id}`);
        });
    }
    render() {
        const quizDetail = this.state.quiz && (
            <div>
                <div className="p-5 bg-gray-200">
                <h1 className="font-semibold text-4xl">{this.state.quiz.title}</h1>
                <p className="text-gray-500">Max Allowed Time: {this.state.quiz.max_allowed_time}</p>
                <form onSubmit={this.handleSubmit}>
                    <input type="submit" className="primary-button" value="Start Quiz" />
                </form>
            </div>
                <div className="pr-5 pl-5">
                    <QuestionList quiz={this.state.quiz} />
                </div>
            </div>

        )
        return this.state.quiz === undefined ? "" : quizDetail;
    }
}

function mapStateToProps(state) {
    return {
        quizInstance: state.quizInstance,
        token: state.TOKEN
    }
}

export default connect(mapStateToProps)(withRouter(QuizDetail));