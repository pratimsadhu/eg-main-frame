"use client";

import { useEffect, useState } from "react";
import { PlaidLinkOptions, usePlaidLink } from "react-plaid-link";
import { useAuth } from "@/contexts/authContext";
import { EGLogo, RedirectHandler } from "@/components/common";
import { fetchLinkToken, exchangeAndSetPublicToken } from "./logic";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const ConnectBanksPage = () => {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [connectMore, setConnectMore] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    return <RedirectHandler />;
  }

  const handleConnectBank = async () => {
    const linkToken = await fetchLinkToken();
    setLinkToken(linkToken);
  };

  //Initializes the Plaid Link widget with the provided link token.
  // Calls exchangeAndSetPublicToken on successful completion.
  const config: PlaidLinkOptions = {
    token: linkToken,
    onSuccess: async (public_token, metadata) => {
      setConnectMore(true);
      console.log(`Finished with link! ${JSON.stringify(metadata)}`);
      await exchangeAndSetPublicToken(public_token);
    },
    onExit: (error, metadata) => {
      console.log(
        `Exited with error: ${JSON.stringify(error)} and Metadata: ${JSON.stringify(metadata)}`
      );
      if (error) {
        console.error("Plaid Link error:", error);
      }
    },
  };

  const { open, ready } = usePlaidLink(config);

  useEffect(() => {
    console.log("Link Token:", linkToken);
    console.log("Ready:", ready);
    if (linkToken && ready) {
      open();
    }
  }, [linkToken, open]);

  return (
    <main className="relative min-h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 z-0"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-pattern bg-opacity-50"></div>
      <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-r from-green-300 to-teal-400 rounded-full blur-3xl opacity-30"></div>

      {/* Header */}
      <header className="absolute top-0 left-0 w-full flex justify-between items-center p-6 z-50">
        <EGLogo />
      </header>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        <div className="bg-white shadow-xl rounded-lg p-8 text-center max-w-xl w-full">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Connect Your Bank
          </h1>
          <p className="text-gray-600 mb-6">
            Securely connect your bank account to track spending, manage
            finances, and gain personalized insights.
          </p>

          {/* Plaid Connect Button */}
          <div className="flex flex-row items-centers justify-center space-x-6">
            {/* Connect Bank Button */}
            <motion.button
              onClick={handleConnectBank}
              className="w-40 h-12 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-blue-700 hover:to-blue-900 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {connectMore ? "Connect More" : "Connect Bank"}
            </motion.button>

            {/* Dashboard Button */}
            <motion.button
              hidden={!connectMore}
              onClick={() => router.push("/dashboard")}
              className={`w-40 h-12 bg-gradient-to-r from-gray-700 to-gray-900 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-gray-600 hover:to-gray-800 transition-all duration-300`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Dashboard
            </motion.button>
          </div>

          <p className="text-sm text-gray-400 mt-4">
            Your data is encrypted and secured with industry-leading standards.
          </p>
        </div>
      </section>
    </main>
  );
};

export default ConnectBanksPage;
