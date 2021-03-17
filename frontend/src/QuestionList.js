import React from "react";
import {Link} from "react-router-dom";

class QuestionList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            questions: props.quiz.questions
        }
    }

    render() {
        return (
            <ul className="mt-3 list-inside list-disc">
                {this.state.questions.map(question => <li key={question.id}><Link to={`/questions/${question.id}/`} className="text-blue-500 underline hover:text-blue-700 text-xl">{question.body}</Link></li>)}
            </ul>
        )
    }
}

export default QuestionList;