import React from "react";
import ReactDOM from 'react-dom';
import './index.sass';
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.min.css';
import { RecoilRoot } from "recoil";
import App from './App';
import { BrowserRouter } from 'react-router-dom';

ReactDOM.render(
  <BrowserRouter>
    <RecoilRoot>
      <App />
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        limit={3}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </RecoilRoot>
  </BrowserRouter>,
  document.getElementById('root'),
);
