import getConfig from "next/config";
import { createRef, useState, RefObject } from 'react';
import Head from "next/head";
import React from "react";
import Layout from "../components/layout";
import HCaptcha from "../node_modules/@hcaptcha/react-hcaptcha";
import axios from 'axios';

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

const hCaptchaComponent = React.createRef<HCaptcha>();

function Form() {
  const [disabled, setDisabled] = useState(true);
  const [query, setQuery] = useState({
    packagename: "",
    hcaptcha: ""
  });

  const handleParam = () => (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setQuery((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const generatePackage = async event => {
    event.preventDefault()
    const data = {}
    Object.entries(query).forEach(([key, value]) => {
      data[key] = value;
    });
    if (data['packagename'] === '' ||
      data['hcaptcha'] === '') return;

    const requestData = {
      'entryChannel': 'Web',
      'safetyNetJwt': '',
      'hcaptchaClientResponse': data['hcaptcha'],
      'packageName': data['packagename']
    }

    axios.post('https://malninstall-configuration.linuxct.space/PackageCreator/GeneratePackage', requestData)
      .then(function (response) {
        const responseUrl = `https://malninstall-configuration.linuxct.space${response.data.downloadUrl}`
        fetch(responseUrl)
          .then((res) => {
            const filename = res.headers.get('Content-Disposition').split('filename=')[1];
            res.blob().then(blob => {
              let url = window.URL.createObjectURL(blob);
              let a = document.createElement('a');
              a.href = url;
              a.download = filename;
              a.click();
            });
          })
          .catch((err) => {
            return Promise.reject({ Error: 'Something went wrong', err });
          })
      })
      .catch(function (error) {
        console.error(error);
      });

    hCaptchaComponent.current.resetCaptcha();
    setQuery({ packagename: "", hcaptcha: "" })
    setDisabled(true)
  }

  function onVerifyCaptcha(token) {
    query.hcaptcha = token;
    setDisabled(false);
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
          <input className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500" name="packagename"
            value={query.packagename} onChange={handleParam()} required />
        </div>
      </div>
      <div className="md:flex md:items-center mb-6 pl-4">
        <HCaptcha ref={hCaptchaComponent} sitekey="072b0fbf-f179-47fa-abcc-cae49c0850dd" onVerify={onVerifyCaptcha} />
      </div>
      {!disabled &&
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
