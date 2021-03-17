import React from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { SET_TOKEN } from "./actionTypes";
import Alert from "./Alert";

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {
                username: "",
                password: "",
            },
            errors: Object.create(null),
            validationClasses: {
                username: "",
                password: "",
            },
            validationFeedback: {
                username: "",
                password: "",
            },
            response: undefined
        }
        this.message = "";
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.setErrors = this.setErrors.bind(this);
        this.resetErrors = this.resetErrors.bind(this);

    }
    setErrors(json) {
        this.setState((prevState) => {
            const usernameInvalid = json.hasOwnProperty("username");
            const passwordInvalid = json.hasOwnProperty("password");
            const message = json.hasOwnProperty("non_field_errors");

            return {
                errors: json,
                validationClasses: {
                    username: usernameInvalid ? "border-red-500" : "border-green-500",
                    password: passwordInvalid ? "border-red-500" : "border-green-500",
                },
                validationFeedback: {
                    username: usernameInvalid ? <div className="text-red-500 font-bold">{json["username"]}</div> : "",
                    password: passwordInvalid ? <div className="text-red-500 font-bold">{json["password"]}</div> : "",
                },
                message: message ? <Alert type="danger">{json["non_field_errors"]}</Alert>: ""
            };
        });
    }
    resetErrors() {
        this.setState({
            errors: Object.create(null),
            validationClasses: {
                username: "",
                password: "",
            },
            validationFeedback: {
                username: "",
                password: "",
            },
            message: undefined
        })
    }
    handleInputChange(event) {
        const name = event.target.name;
        const value = event.target.value;
        this.setState((prevState) => {
            return {data: {...prevState.data, [name]: value}}
        });
    }
    handleSubmit(event) {
        fetch(`${process.env.REACT_APP_API_URL}/accounts/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(this.state.data)
        }).then(response => {
            response.json().then((data) => {
                if (!response.ok) {
                    this.setErrors(data);
                }
                else {
                    this.resetErrors();
                    this.setState({
                        message: <Alert type="success">Login Successfull! Redirecting to homepage in 5 seconds....</Alert>
                    });
                    this.props.dispatch({type: SET_TOKEN, token: data.token})
                    window.setTimeout(() => this.props.history.push('/'), 5000)
                }
            })
        })
        event.preventDefault();
    }
    render() {
        return (
            <div className="p-5">
                <h1 className="font-semibold text-4xl mb-8">Login</h1>
                {this.state.message}
                <form onSubmit={this.handleSubmit}>
                    <div className="mt-4">
                        <label htmlFor="username" className="box-label">Username</label>
                        <input type="text" onChange={this.handleInputChange} value={this.state.data.username}
                                className={"textbox " + this.state.validationClasses.username}
                                id="username" name="username"
                        />
                        {this.state.validationFeedback.username}
                    </div>
                    <div>
                        <label htmlFor="password" className="box-label">Password</label>
                        <input type="password" onChange={this.handleInputChange} value={this.state.data.password}
                                className={"textbox " + this.state.validationClasses.password} name="password" id="password"
                        />
                        {this.state.validationFeedback.password}
                    </div>
                    <button type="submit" className="primary-button">Login</button>
                </form>
            </div>
        );
    }
}

function mapStateToProps(state){
    return {
        token: state.TOKEN
    }
}

export default withRouter(connect(mapStateToProps)(Login));