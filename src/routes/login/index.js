import React, { Component, Fragment } from "react";
import IntlMessages from "Util/IntlMessages";
import { Row, Card, CardTitle, Form, Label, Input, Button } from "reactstrap";
import { NavLink } from "react-router-dom";

import { Colxx } from "Components/CustomBootstrap";

import { connect } from "react-redux";
import { loginUser } from "Redux/actions";

class LoginLayout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: ""
    };
  }

  handleChangeInput = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }
  onUserLogin() {
    if (this.state.email !== "" && this.state.password !== "") {
      this.props.loginUser(this.state, this.props.history);
    }
  }

  componentDidMount() {
    document.body.classList.add("background");
  }
  componentWillUnmount() {
    document.body.classList.remove("background");
  }
  render() {
    return (
      <Fragment>
        <div className="fixed-background" />
        <main>
          <div className="container">
            <Row className="h-100">
              <Colxx xxs="12" md="10" className="mx-auto my-auto">
                <Card className="auth-card">
                  <div className="position-relative image-side ">
                    <p className="text-white h2">DESBAR</p>
                    <p className="white">
                      Introduce tus credenciales, email y password
                      <br />
                      Recuerda que debes ser administrador{" "}
                    </p>
                  </div>
                  <div className="form-side">
                    <NavLink to={`/`} className="white">
                      <span className="logo-single" />
                    </NavLink>
                    <CardTitle className="mb-4">
                      Iniciar sesión
                    </CardTitle>
                    <Form>
                      <Label className="form-group has-float-label mb-4">
                        <Input type="email" value={this.state.email} onChange={this.handleChangeInput} name='email' />
                        <IntlMessages id="Email" />
                      </Label>
                      <Label className="form-group has-float-label mb-4">
                        <Input type="password" value={this.state.password} onChange={this.handleChangeInput} name='password'/>
                        <IntlMessages
                          id="Contraseña"
                        />
                      </Label>
                      <div className="d-flex justify-content-between align-items-center">
                        <NavLink to={`/forgot-password`}>
                          Recuperar contraseña
                        </NavLink>
                        <Button
                          color="primary"
                          className="btn-shadow"
                          size="lg"
                          onClick={() => this.onUserLogin()}
                        >
                          INICIAR SESIÓN
                        </Button>
                      </div>
                    </Form>
                  </div>
                </Card>
              </Colxx>
            </Row>
          </div>
        </main>
      </Fragment>
    );
  }
}
const mapStateToProps = ({ authUser }) => {
  const { user, loading } = authUser;
  return { user, loading };
};



export default connect(
  mapStateToProps,
  {
    loginUser
  }
)(LoginLayout);
