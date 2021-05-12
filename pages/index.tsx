import getConfig from "next/config";
import Head from "next/head";
import React from "react";
import Layout from "../components/layout";
import HCaptcha from "../node_modules/@hcaptcha/react-hcaptcha";

const { publicRuntimeConfig } = getConfig();
const { title } = publicRuntimeConfig.siteMetaData;

const Home = () => {
  return (
    <Layout>
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h1>{title}</h1>
          <Form></Form>

        </div>
      </section>
    </Layout>
  );
};

function Form() {
  let state = {isVerified: false};
  let captcha = React.createRef();
  const { isVerified } = state;

  const generatePackage = async event => {
    event.preventDefault()

    const res = await fetch('/api/create', {
      body: JSON.stringify({
        name: event.target.name.value
      }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    })

    const result = await res.json()
    console.log(result);
    // result.user => 'Ada Lovelace'
  }

  const handleChange = function(event) {
    this.setState({isVerified: true});
  }

  const onVerifyCaptcha = function(token) {
    console.log("Verified: " + token);
    this.setState({isVerified: true})
  }

  const handleSubmit = function(event) {
    event.preventDefault()
    this.child.execute()
  }

  const handleReset = function(event) {
    event.preventDefault()
    this.captcha.current.resetCaptcha()
    this.setState({isVerified: false})
  }

  return (
    <form className="w-full max-w-lg" onSubmit={generatePackage}>
      <div className="md:flex md:items-center mb-6">
        <div className="md:w-1/3">
          <label className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4" htmlFor="inline-full-name">
            Full Package Name
          </label>
        </div>
        <div className="md:w-2/3">
          <input className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500" id="inline-full-name" type="text" required placeholder="com.package.name" />
        </div>
      </div>
      <div className="md:flex md:items-center mb-6">
        <HCaptcha sitekey="81554bf3-7391-4691-94fe-ed8ab8a1b80e" onVerify={onVerifyCaptcha} />
      </div>
      {isVerified && 
        <div className="md:flex md:items-center">
          <div className="md:w-1/3"></div>
          <div className="md:w-2/3">
            <button className="shadow bg-blue-500 hover:bg-blue-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded" type="submit">
              Generate
            </button>
          </div>
        </div>
      }
      
    </form>


    // <form onSubmit={registerUser}>
    //   <label htmlFor="name">Name</label>
    //   <input id="name" name="name" type="text" autoComplete="name" required />
    //   <button type="submit">Register</button>
    // </form>
  )
}

export default Home;
