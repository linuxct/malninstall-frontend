import getConfig from "next/config"
import { Fragment, createRef, useRef, useState } from 'react'
import Head from "next/head"
import React from "react"
import Layout from "../components/layout"
import { Dialog, Transition } from '@headlessui/react'
import { ExclamationIcon, CheckCircleIcon } from '@heroicons/react/outline'
import HCaptcha from "@hcaptcha/react-hcaptcha"
import axios from 'axios'

const { publicRuntimeConfig } = getConfig();
const { title } = publicRuntimeConfig.siteMetaData;
const { apiBaseUrl } = publicRuntimeConfig;

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

const hCaptchaComponent = createRef<HCaptcha>();

function Form() {
  const [disabled, setDisabled] = useState(true);
  const [query, setQuery] = useState({
    packagename: "",
    hcaptcha: ""
  });

  const [showModal, setShowModal] = useState(false)
  const okButtonRef = useRef()
  const [dialogText, setDialogText] = useState("")
  const [dialogTitle, setDialogTitle] = useState("")
  const [isError, setIsError] = useState(true)

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
      data['hcaptcha'] === '') {
      setIsError(true)
      setDialogTitle("Error!")
      setDialogText("Please fill out all the fields in the form and complete the captcha.")
      setShowModal(true)
      return;
    };

    const requestData = {
      'entryChannel': 'Web',
      'safetyNetJwt': '',
      'hcaptchaClientResponse': data['hcaptcha'],
      'packageName': data['packagename']
    }

    axios.post(`${apiBaseUrl}/PackageCreator/GeneratePackage`, requestData)
      .then(function (response) {
        const responseUrl = `${apiBaseUrl}${response.data.downloadUrl}`
        const fileName = response.data.fileName ?? "Removal Tool.apk";
        fetch(responseUrl)
          .then((res) => {
            res.blob().then(blob => {
              setIsError(false)
              setDialogTitle("Success!")
              setDialogText("Your package will be downloaded shortly")
              let url = window.URL.createObjectURL(blob);
              let a = document.createElement('a');
              a.href = url;
              a.download = fileName;
              a.click();
            });
          })
          .catch((err) => {
            setIsError(true);
            setDialogTitle("Error!");
            setDialogText(`An error has occurred while generating the package.<br/>Details: <br/>${err}`);
            setShowModal(true);
            return Promise.reject({ Error: 'Something went wrong', err });
          })
      })
      .catch(function (error) {
        setIsError(true);
        setDialogTitle("Error!");
        setDialogText(`An error has occurred while generating the package.<br/>Details: <br/>${error}`);
        setShowModal(true);
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
    <div>
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
      <div id="modal">
        <Transition.Root show={showModal} as={Fragment}>
          <Dialog
            as="div"
            static
            className="fixed z-10 inset-0 overflow-y-auto"
            initialFocus={okButtonRef}
            open={showModal}
            onClose={setShowModal}
          >
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
              </Transition.Child>

              {/* This element is to trick the browser into centering the modal contents. */}
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                &#8203;
          </span>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        {
                          isError ?
                            <ExclamationIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                            :
                            <CheckCircleIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                        }
                      </div>
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">{dialogTitle}</Dialog.Title>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">{dialogText}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => setShowModal(false)}
                      ref={okButtonRef}
                    >
                      OK
                </button>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>
      </div>
    </div>
  )
}

export default Home;
