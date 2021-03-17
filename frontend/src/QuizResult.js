import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import React from "react";

class QuizResult extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            quizInstanceID: this.props.match.params.quizInstanceID,
            percentage: undefined
        }
    }
    componentDidMount() {
        fetch(`${process.env.REACT_APP_API_URL}/result/${this.state.quizInstanceID}/`).then(response => response.json()).then(data => {
            this.setState({
                percentage: data["result"]["grade_percentage"]
            });
        }).then(error => console.log("Err", error));
    }
    render() {
        return (
            <div style={{margin: "auto"}}>
                <h2>Quiz Result</h2>
                <div>
                    {this.state.percentage}%
                </div>
            </div>
        )
    }
}

function mapStateToProps( state ) {
    return { quizInstance: state.QUIZ_INSTANCE }

}

export default withRouter(connect(mapStateToProps)(QuizResult));