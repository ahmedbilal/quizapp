import React from "react";
import Alert from "./Alert";

class Signup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {
                username: "",
                email: "",
                password: "",
                password2: ""
            },
            errors: Object.create(null),
            validationClasses: {
                username: "",
                email: "",
                password: "",
                password2: ""
            },
            validationFeedback: {
                username: "",
                email: "",
                password: "",
                password2: ""
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
            const emailInvalid = json.hasOwnProperty("email");
            const passwordInvalid = json.hasOwnProperty("password");
            const password2Invalid = json.hasOwnProperty("password2");
            const message = json.hasOwnProperty("non_field_errors");

            return {
                errors: json,
                validationClasses: {
                    username: usernameInvalid ? "border-red-500" : "border-green-500",
                    email: emailInvalid ? "border-red-500" : "border-green-500",
                    password: passwordInvalid ? "border-red-500" : "border-green-500",
                    password2: password2Invalid ? "border-red-500" : "border-green-500",
                },
                validationFeedback: {
                    username: usernameInvalid ? <div className="invalid-feedback">{json["username"]}</div> : "",
                    email: emailInvalid ? <div className="invalid-feedback">{json["email"]}</div> : "",
                    password: passwordInvalid ? <div className="invalid-feedback">{json["password"]}</div> : "",
                    password2: password2Invalid ? <div className="invalid-feedback">{json["password2"]}</div> : ""
                },
                message: message ? <Alert type="danger">{json["non_field_errors"]}</Alert> : ""
            };
        });
    }
    resetErrors() {
        this.setState({
            errors: Object.create(null),
            validationClasses: {
                username: "",
                email: "",
                password: "",
                password2: ""
            },
            validationFeedback: {
                username: "",
                email: "",
                password: "",
                password2: ""
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
        fetch(`${process.env.REACT_APP_API_URL}/accounts/signup/`, {
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
                        message: <Alert type="success">Account created successfully!</Alert>
                    });
                }
            })
        })
        event.preventDefault();
    }
    render() {
        return (
            <div className="p-5">
                <h1 className="font-semibold text-4xl mb-8">Signup</h1>
                {this.state.message}
                <form onSubmit={this.handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="username" className="box-label">Username</label>
                        <input type="text" onChange={this.handleInputChange} value={this.state.data.username}
                               className={"textbox " + this.state.validationClasses.username}
                               id="username" name="username"
                        />
                        {this.state.validationFeedback.username}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="email" className="box-label">Email address</label>
                        <input type="email" onChange={this.handleInputChange} value={this.state.data.email}
                               className={"textbox " + this.state.validationClasses.email} id="email" name="email" aria-describedby="emailHelp"
                        />
                        <div className="text-gray-600">We'll never share your email with anyone else.</div>
                        {this.state.validationFeedback.email}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="box-label">Password</label>
                        <input type="password" onChange={this.handleInputChange} value={this.state.data.password}
                               className={"textbox " + this.state.validationClasses.password} name="password" id="password"
                        />
                        {this.state.validationFeedback.password}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password2" className="box-label">Confirm Password</label>
                        <input type="password" onChange={this.handleInputChange} value={this.state.data.password2}
                               className={"textbox " + this.state.validationClasses.password2} name="password2" id="password2"
                        />
                        {this.state.validationFeedback.password2}
                    </div>
                    <button type="submit" className="primary-button">Signup</button>
                </form>
            </div>
        );
    }
}

export default Signup;