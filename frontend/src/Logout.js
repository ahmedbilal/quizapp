import { connect } from "react-redux";
import React from "react";
import { Redirect } from "react-router-dom";
import { UNSET_TOKEN } from "./actionTypes";

class Logout extends React.Component {
    render() {
        fetch(`${process.env.REACT_APP_API_URL}/accounts/logout/`, {
            method: 'POST',
            headers: {
                'Authorization': `Token ${this.props.token}`
            }
        }).then(response => {
            // Either, the logout would succeed or the user's token is already invalid
            // in both cases we would unset user's token
            if (response.ok || response.status === 401) {
                this.props.dispatch({type: UNSET_TOKEN})
                return <Redirect to="/"></Redirect>;
            }
        })
        return <Redirect to="/"></Redirect>;
    }
}

function mapStateToProps(state) {
    return {
        token: state.TOKEN
    }
}
export default connect(mapStateToProps)(Logout);
