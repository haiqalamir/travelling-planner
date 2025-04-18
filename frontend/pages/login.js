// pages/login.js
import React from 'react';
import { Form, Input, Button, message } from 'antd';
import axios from 'axios';
import Head from 'next/head';
import Link from 'next/link';
import Router from 'next/router';

class LoginForm extends React.Component {
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        // "identifier" accepts either username or email
        axios
          .post('http://localhost:3001/api/login', values)
          .then((res) => {
            // Save the response data (or token) to localStorage.
            // Adjust the data you store based on what your backend returns.
            localStorage.setItem('user', JSON.stringify(res.data));
            // Redirect to the home (index) page.
            Router.push('/');
          })
          .catch((error) => {
            // Use Ant Design's message component to show a popup error.
            message.error("Incorrect username/password!", 3);
          });
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <>
        <Head>
          <title>User Login - Travel Planner</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <div className="container">
          <header className="site-header">
            <div className="logo">
              <h1>Login</h1>
            </div>
            <nav className="site-nav">
              <Link href="/"><a>Home</a></Link>
              <Link href="/register"><a>Register</a></Link>
            </nav>
          </header>

          <section className="content-section">
            <div className="card form-card">
              <h2>Login to Your Account</h2>
              <Form onSubmit={this.handleSubmit} layout="vertical">
                <Form.Item label="Username or Email">
                  {getFieldDecorator('identifier', {
                    rules: [{ required: true, message: 'Please input your username or email!' }],
                  })(<Input />)}
                </Form.Item>
                <Form.Item label="Password">
                  {getFieldDecorator('password', {
                    rules: [{ required: true, message: 'Please input your password!' }],
                  })(<Input.Password />)}
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    Login
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </section>

          <footer className="site-footer">
            <p>&copy; {new Date().getFullYear()} Travel Planner</p>
          </footer>
        </div>
      </>
    );
  }
}

const WrappedLoginForm = Form.create({ name: 'login_form' })(LoginForm);
export default WrappedLoginForm;
