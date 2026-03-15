import { Suspense } from "react";
import VerifyPinForm from "./VerifyPinForm";
import React from 'react'

const VerifyPin = () => {
  return (
    <div className="relative h-screen bg-white">
      <Suspense>
        <VerifyPinForm />
      </Suspense>
    </div>
  );
};

export default VerifyPin;
