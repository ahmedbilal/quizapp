import { connect } from "react-redux";
import { withRouter, Route, Redirect } from "react-router-dom";
import React from "react";

class PrivateRoute extends React.Component {
    render() {
        const { children, ...rest } = this.props;
        return (
            <Route  {...rest}
                    render={
                        ({location}) => this.props.token ? children : <Redirect to="/accounts/login" />
                    }
            />
        );
    }
}

function mapStateToProps(state) {
    return {
        token: state.TOKEN
    }
}

export default withRouter(connect(mapStateToProps)(PrivateRoute));
