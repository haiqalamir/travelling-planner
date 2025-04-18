// pages/register.js
import React from 'react';
import { Form, Input, Button } from 'antd';
import axios from 'axios';
import Head from 'next/head';
import Link from 'next/link';

class RegisterForm extends React.Component {
  state = {
    message: ''
  };

  // Custom validator for confirming password
  validateToNextPassword = (rule, value, callback) => {
    const { form } = this.props;
    if (value && value !== form.getFieldValue('password')) {
      callback('The two passwords do not match!');
    } else {
      callback();
    }
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        // Send registration data to the API
        axios.post('http://localhost:3001/api/register', values)
          .then(res => this.setState({ message: res.data.message || 'Registration successful!' }))
          .catch(error => this.setState({
            message: error.response && error.response.data && error.response.data.error
              ? error.response.data.error
              : 'Registration failed.'
          }));
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <>
        <Head>
          <title>User Registration - Travel Planner</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <div className="container">
          <header className="site-header">
            <div className="logo">
              <h1>Register</h1>
            </div>
            <nav className="site-nav">
              <Link href="/"><a>Home</a></Link>
              <Link href="/login"><a>Login</a></Link>
            </nav>
          </header>

          <section className="content-section">
            <div className="card form-card">
              <h2>Create Your Account</h2>
              <Form onSubmit={this.handleSubmit} layout="vertical">
                <Form.Item label="Email">
                  {getFieldDecorator('email', {
                    rules: [
                      { required: true, message: 'Please input your email!' },
                      { type: 'email', message: 'Please enter a valid email!' }
                    ],
                  })(<Input />)}
                </Form.Item>

                <Form.Item label="Username">
                  {getFieldDecorator('username', {
                    rules: [{ required: true, message: 'Please input your username!' }],
                  })(<Input />)}
                </Form.Item>

                <Form.Item label="Password" hasFeedback>
                  {getFieldDecorator('password', {
                    rules: [{ required: true, message: 'Please input your password!' }],
                  })(<Input.Password />)}
                </Form.Item>

                <Form.Item label="Confirm Password" hasFeedback>
                  {getFieldDecorator('confirmPassword', {
                    rules: [
                      { required: true, message: 'Please confirm your password!' },
                      { validator: this.validateToNextPassword }
                    ],
                  })(<Input.Password />)}
                </Form.Item>

                <Form.Item label="Name">
                  {getFieldDecorator('name', {
                    rules: [{ required: true, message: 'Please input your name!' }],
                  })(<Input />)}
                </Form.Item>

                <Form.Item label="Phone Number">
                  {getFieldDecorator('phoneNumber', {
                    rules: [{ required: true, message: 'Please input your phone number!' }],
                  })(<Input />)}
                </Form.Item>

                <Form.Item label="Address">
                  {getFieldDecorator('address', {
                    rules: [{ required: true, message: 'Please input your address!' }],
                  })(<Input.TextArea rows={3} />)}
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    Register
                  </Button>
                </Form.Item>
              </Form>
              {this.state.message && <p className="form-message">{this.state.message}</p>}
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

const WrappedRegisterForm = Form.create({ name: 'register_form' })(RegisterForm);
export default WrappedRegisterForm;
