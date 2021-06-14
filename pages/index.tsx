import getConfig from "next/config"
import { Fragment, createRef, useRef, useState } from 'react'
import Head from "next/head"
import React from "react"
import Layout from "../components/layout"
import { Dialog, Transition } from '@headlessui/react'
import { ExclamationIcon, CheckCircleIcon, InformationCircleIcon, QuestionMarkCircleIcon } from '@heroicons/react/outline'
import HCaptcha from "@hcaptcha/react-hcaptcha"
import axios from 'axios'

const { publicRuntimeConfig } = getConfig();
const { title } = publicRuntimeConfig.siteMetaData;
const { apiBaseUrl, faqText, enableMobileClientUpsell } = publicRuntimeConfig;

const Home = () => {
  return (
    <Layout>
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Form></Form>
        </div>
      </section>
    </Layout>
  );
};

const capitalLettersRegex = /[A-Z]/;
const packageNameRegex = /\w+\.\w+\.\w+/;
const hCaptchaComponent = createRef<HCaptcha>();
enum ModalState {
  Informative,
  Error,
  Question,
  Success
}
enum ModalQuestionType {
  Extension,
  CapitalLetter,
  PackageName
}

function Form() {
  const [disabled, setDisabled] = useState(true);
  const [query, setQuery] = useState({
    packagename: "",
    hcaptcha: ""
  });

  const [showModal, setShowModal] = useState(false)
  const formRef = useRef<HTMLFormElement>()
  const okButtonRef = useRef()
  const cancelButtonRef = useRef()
  const [dialogText, setDialogText] = useState("")
  const [dialogTitle, setDialogTitle] = useState("")
  const [modalState, setModalState] = useState<ModalState>()
  const [modalQuestionType, setModalQuestionType] = useState<ModalQuestionType>()
  const [acceptedExtension, setAcceptedExtension] = useState(false)
  const [acceptedCapitalLetter, setAcceptedCapitalLetter] = useState(false)
  const [acceptedPackageName, setAcceptedPackageName] = useState(false)

  const handleParam = () => (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setQuery((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const generatePackage = async event => {
    if (event !== null) event.preventDefault()
    const data = {}
    Object.entries(query).forEach(([key, value]) => {
      data[key] = value;
    });
    if (data['packagename'] === '' ||
      data['hcaptcha'] === '') {
      setModalState(ModalState.Error)
      setDialogTitle("Error!")
      setDialogText("Please fill out all the fields in the form and complete the captcha.")
      setShowModal(true)
      return;
    };

    if (data['packagename'].toLowerCase().includes('.apk') && !acceptedExtension) {
      setModalState(ModalState.Question)
      setModalQuestionType(ModalQuestionType.Extension)
      setDialogTitle("Are you sure?")
      setDialogText(`
      The package name you supplied contains an '.apk' extension in it.<br/><br/>
      Please remember that you must not submit the downloaded APK name, 
      but its package name. Check the Help tab for details on how to check it.<br/><br/>
      Proceed anyways?
      `)
      setShowModal(true)
      return;
    }

    if (capitalLettersRegex.test(data['packagename'][0]) && !acceptedCapitalLetter) {
      setModalState(ModalState.Question)
      setModalQuestionType(ModalQuestionType.CapitalLetter)
      setDialogTitle("Are you sure?")
      setDialogText(`
      The package name you supplied starts with a capital letter.<br/><br/>
      In mobile devices, the keyboard usually starts typing in capital letters
      automatically, hence why you should double check whether the package name
      should contain this.<br/><br/>
      Proceed anyways?
      `)
      setShowModal(true)
      return;
    }

    if (!packageNameRegex.test(data['packagename']) && !acceptedPackageName) {
      setModalState(ModalState.Question)
      setModalQuestionType(ModalQuestionType.PackageName)
      setDialogTitle("Are you sure?")
      setDialogText(`
      The package name you supplied appears to be invalid.<br/><br/>
      Please check that you entered the correct package name for the application you want to overwrite. 
      If you are sure it is correct, you can continue.<br/><br/>
      Proceed anyways?
      `)
      setShowModal(true)
      return;
    }

    setAcceptedExtension(false)
    setAcceptedCapitalLetter(false)
    setAcceptedPackageName(false)

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
              setModalState(ModalState.Success)
              setDialogTitle("Success!")
              setDialogText("Your package will be downloaded now.<br/>For further instructions, check the Help tab.")
              setShowModal(true)
              let url = window.URL.createObjectURL(blob);
              let a = document.createElement('a');
              a.href = url;
              a.download = fileName;
              a.click();
            });
          })
          .catch((err) => {
            setModalState(ModalState.Error)
            setDialogTitle("Error!")
            setDialogText(`An error has occurred while generating the package.<br/>Details: <br/>${err}`)
            setShowModal(true)
            return Promise.reject({ Error: 'Something went wrong', err });
          })
      })
      .catch(function (err) {
        setModalState(ModalState.Error)
        setDialogTitle("Error!")
        setDialogText(`An error has occurred while generating the package.<br/>Details: <br/>${err}`)
        setShowModal(true)
      });

    hCaptchaComponent.current.resetCaptcha();
    setQuery({ packagename: "", hcaptcha: "" })
    setDisabled(true)
  }

  function onVerifyCaptcha(token) {
    query.hcaptcha = token;
    setDisabled(false);
  }

  function displayHelp() {
    setModalState(ModalState.Informative)
    setDialogTitle("Frequently Asked Questions (FAQ)")
    setDialogText(faqText)
    setShowModal(true)
  }

  function resolveContinueModal() {
    setShowModal(false)
    switch (modalQuestionType) {
      case ModalQuestionType.Extension:
        setAcceptedExtension(true)
        break;
      case ModalQuestionType.CapitalLetter:
        setAcceptedCapitalLetter(true)
        break;
      case ModalQuestionType.PackageName:
        setAcceptedPackageName(true)
        break;
    }
    setTimeout(() =>
      formRef.current.dispatchEvent(
        new Event("submit", { cancelable: true, bubbles: true })
      ), 1000)
  }

  return (
    <div>
      <button onClick={() => displayHelp()} className="float-right shadow bg-blue-500 hover:bg-blue-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded" type="button">Help</button>
      <h1>{title}</h1>
      <form ref={formRef} className="w-full max-w-lg" onSubmit={generatePackage}>
        <div className="md:flex md:items-center mb-6">
          <div className="md:w-1/3">
            <label className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4" htmlFor="inline-full-name">
              Package Name
                  </label>
          </div>
          <div className="md:w-2/3">
            <input className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500" name="packagename"
              value={query.packagename} placeholder="com.application.name" onChange={handleParam()} required />
          </div>
        </div>
        <div className="md:flex md:items-center mb-6 md:pl-12">
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
      { enableMobileClientUpsell &&
        <section className="float-right">
          <a href="https://play.google.com/store/apps/details?id=space.linuxct.malninstall">
            <img className="mock-device max-w-sm" src="/images/mock.png"></img>
          </a>
        </section>
      }
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
                    {
                      modalState == ModalState.Question ?
                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
                          <QuestionMarkCircleIcon className="h-6 w-6 text-yellow-600" aria-hidden="true" />
                        </div>
                        : modalState == ModalState.Error ?
                          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                            <ExclamationIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                          </div>
                          : modalState == ModalState.Informative ?
                            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                              <InformationCircleIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
                            </div>
                            :
                            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                              <CheckCircleIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                            </div>
                    }
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900" dangerouslySetInnerHTML={{ __html: dialogTitle }}></Dialog.Title>
                      <div className="mt-2">
                        <p dangerouslySetInnerHTML={{ __html: dialogText }} className="text-sm text-gray-500"></p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  {
                    modalState == ModalState.Question ?
                      <div>
                        <button
                          type="button"
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                          onClick={() => setShowModal(false)}
                          ref={cancelButtonRef}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                          onClick={async () => resolveContinueModal()}
                          ref={okButtonRef}
                        >
                          Continue
                        </button>
                      </div>
                      :
                      <button
                        type="button"
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={() => setShowModal(false)}
                        ref={okButtonRef}
                      >
                        {modalState == ModalState.Informative ? "Close" : "OK"}
                      </button>
                  }
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  )
}

export default Home;
