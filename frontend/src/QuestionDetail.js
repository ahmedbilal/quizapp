import React from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import Alert from "./Alert";

class QuestionDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            question: undefined,
            selectedOption: undefined,
            explanation: undefined,
            nextQuestionID: undefined,
            correct: undefined,
            questionID: this.props.match.params.questionID
        };
        this.formHandler = this.formHandler.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }
    componentDidMount() {
        fetch(`${process.env.REACT_APP_API_URL}/questions/${this.state.questionID}/`)
        .then(response => response.json())
        .then(question => this.setState({question: question}));
    }
    componentDidUpdate(prevProps) {
        const currentQuestionID = this.props.match.params.questionID;
        const previousQuestionID = prevProps.match.params.questionID
        if (currentQuestionID !== previousQuestionID) {
            fetch(`${process.env.REACT_APP_API_URL}/questions/${currentQuestionID}/`)
            .then(response => response.json()).then(question => this.setState({question: question}));

            this.setState({
                selectedOption: undefined,
                explanation: undefined,
                nextQuestionID: undefined,
                correct: undefined
            })
        }
    }
    formHandler(event) {
        event.preventDefault();
        const requestBody = {
            question: this.state.question.id,
            quiz_instance: this.props.quizInstance,
            selected_option: this.state.selectedOption
        };
        fetch(`${process.env.REACT_APP_API_URL}/answers/`, {
            'method': 'POST',
            'headers': {
                'Content-Type': 'application/json',
                'Authorization': `Token ${this.props.token}`
            },
            body: JSON.stringify(requestBody)
        }).then(response => {
            if (!response.ok) {
                throw Error(response.statusText)
            }
            return response.json();
        }).then(data => {
            this.setState({
                explanation: data['explanation'],
                nextQuestionID: data['next_question'],
                correct: data['correct']
            });
        }).catch(error => console.log("Err!", error))

    }
    handleChange(event) {
        this.setState({selectedOption: event.target.value});
    }
    render() {
        const question = this.state.question;
        const isQuestionLoading = question === undefined;
        const explanation = this.state.explanation ? (
            <div style={{marginTop: "3rem", fontSize: "32px"}}>
                <h3>Explanation</h3>
                {this.state.explanation}
            </div>
        ) : ""
        let nextButton = this.state.nextQuestionID ? (
            <button className="primary-button" onClick={e => {e.preventDefault(); this.props.history.push(`/questions/${this.state.nextQuestionID}`)}}>Next</button>
        ) : undefined
        if (this.state.question && this.state.nextQuestionID === null) {
            nextButton = <button className="success-button" onClick={e => {e.preventDefault(); this.props.history.push(`/result/${this.props.quizInstance}`)}}>Next</button>
        }
        let [submitButtonValue, submitButtonClassName] = [undefined, undefined];
        switch (this.state.correct) {
            case true:
                [submitButtonValue, submitButtonClassName] = ["Correct!", "success-button"];
                break;
            case false:
                [submitButtonValue, submitButtonClassName] = ["Incorrect!", "failure-button"];
                break;
            default:
                [submitButtonValue, submitButtonClassName] = ["Submit", "primary-button"];
                break;

        }
        if (!this.props.quizInstance) {
            return (
                <Alert type="danger">No Quiz Instance Found! Go back to the quiz page and start it again.</Alert>
            );
        }

        return isQuestionLoading ? "Loading Question" :(
            <div className="p-5">
                <div>
                    <p className="text-xl font-bold">{this.state.question.body}</p>
                    <form onSubmit={this.formHandler}>
                        {
                            this.state.question.options.map((option, index) => {
                                return (
                                    <div className="form-check mt-4" key={`option${index}`}>
                                        <input className="bg-white" type="radio" name="options" onChange={this.handleChange} value={option.id} checked={this.state.selectedOption == option.id} id={`option_${index}`}/>
                                        <label className="ml-2" htmlFor={`option_${index}`}>{option.body}</label>
                                    </div>
                                );
                            })
                        }
                        <input type="submit" disabled={this.state.correct} className={submitButtonClassName} value={submitButtonValue} style={{marginTop: "1rem"}} />
                    </form>
                    {explanation}
                    {nextButton}
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        quizInstance: state.QUIZ_INSTANCE,
        token: state.TOKEN
    }
}

export default withRouter(connect(mapStateToProps, null, null, { pure: false })(QuestionDetail));
