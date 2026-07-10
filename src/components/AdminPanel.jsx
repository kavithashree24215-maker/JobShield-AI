import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { CheckCircle } from "lucide-react";

export default function AdminPanel({ loadCompanies }) {
  const [success, setSuccess] = useState("");
  const [company, setCompany] = useState({
    name: "",
    website: "",
    industry: "",
    employees: "",
    details: "",
    logo: "",
  });
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const snapshot = await getDocs(collection(db, "verificationRequests"));

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setRequests(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setCompany({
      ...company,
      [e.target.name]: e.target.value,
    });
  };

  const saveCompany = async () => {
    try {
      await addDoc(collection(db, "verified_companies"), company);

      setSuccess("Company approved successfully!");
      setCompany({
        name: "",
        website: "",
        industry: "",
        employees: "",
        details: "",
        logo: "",
      });
    } catch (err) {
      console.error(err);
      alert("Failed to add company");
    }
  };
  const approveCompany = async (req) => {
    try {
      // Add to verified companies
      await addDoc(collection(db, "verified_companies"), {
        name: req.companyName,
        website: req.website,
        industry: req.industry,
        employees: "Not Available",
        details: req.reason,
        logo: "🏢",
      });

      // Delete from verification requests
      await deleteDoc(doc(db, "verificationRequests", req.id));
      await loadCompanies();

      // Refresh table
      fetchRequests();

      setSuccess("Company Approved Successfully!");
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(err);
      alert("Approval Failed");
    }
  };

  return (
    <div className="max-w-6xl mx-auto mb-8 bg-white dark:bg-slate-900 p-6 rounded-xl shadow">
      {success && (
        <div className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>

            <div>
              <h3 className="font-semibold text-green-400">Company Approved</h3>

              <p className="text-sm text-slate-300">
                Company has been verified successfully.
              </p>
            </div>
          </div>

          <button
            onClick={() => setSuccess("")}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}
      <h2 className="text-2xl font-bold mb-4">Verification Requests</h2>

      <table className="w-full border-collapse border border-slate-700 text-white">
        <thead>
          <tr className="bg-slate-800">
            <th className="border border-slate-700 p-3 text-left">Company</th>
            <th className="border border-slate-700 p-3 text-left">Website</th>
            <th className="border border-slate-700 p-3 text-left">Email</th>
            <th className="border border-slate-700 p-3 text-left">Industry</th>
            <th className="border border-slate-700 p-3 text-center">Reason</th>
            <th className="border border-slate-700 p-3 text-center">Status</th>
            <th className="border border-slate-700 p-3 text-center">Action</th>
          </tr>
        </thead>

        <tbody>
          {requests.length === 0 ? (
            <tr>
              <td
                colSpan="7"
                className="text-center py-10 text-slate-400 border border-slate-700"
              >
                No Pending Requests
              </td>
            </tr>
          ) : (
            requests.map((req) => (
              <tr
                key={req.id}
                className="hover:bg-slate-800 transition border-b border-slate-700"
              >
                <td className="border border-slate-700 p-3 font-semibold">
                  {req.companyName}
                </td>

                <td className="border border-slate-700 p-3">{req.website}</td>

                <td className="border border-slate-700 p-3">{req.email}</td>

                <td className="border border-slate-700 p-3">{req.industry}</td>

                <td className="border border-slate-700 p-3 text-center">
                  <button
                    onClick={() => setSelectedRequest(req)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg"
                  >
                    View
                  </button>
                </td>

                <td className="border border-slate-700 p-3 text-center">
                  <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm">
                    Pending
                  </span>
                </td>

                <td className="border border-slate-700 p-3 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => setSelectedRequest(req)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg"
                    >
                      View
                    </button>

                    <button
                      onClick={() => approveCompany(req)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg"
                    >
                      Approve
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 w-[550px] shadow-xl">
            <h2 className="text-2xl font-bold mb-5">Company Verification</h2>

            <div className="space-y-3">
              <p>
                <b>Company :</b> {selectedRequest.companyName}
              </p>

              <p>
                <b>Website :</b> {selectedRequest.website}
              </p>

              <p>
                <b>Email :</b> {selectedRequest.email}
              </p>

              <p>
                <b>Industry :</b> {selectedRequest.industry}
              </p>

              <p>
                <b>Status :</b> {selectedRequest.status}
              </p>

              <div>
                <b>Reason</b>

                <div className="mt-2 p-3 rounded bg-slate-100 dark:bg-slate-800">
                  {selectedRequest.reason}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-5 py-2 rounded bg-gray-500 text-white"
              >
                Close
              </button>

              <button
                onClick={() => {
                  approveCompany(selectedRequest);
                  setSelectedRequest(null);
                }}
                className="px-5 py-2 rounded bg-green-600 text-white"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
