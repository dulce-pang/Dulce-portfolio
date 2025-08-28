import { React , useRef, useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { useAuthState } from '~/components/contexts/UserContext';
import { SignInButton } from '~/components/domain/auth/SignInButton';
import { SignOutButton } from '~/components/domain/auth/SignOutButton';
import { Head } from '~/components/shared/Head';
import { useFirestore, useStorage } from "~/lib/firebase";
import { collection, query, getDocs, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { uploadBytesResumable, getDownloadURL, ref } from "firebase/storage";
import { ToastContainer, toast } from 'react-toastify';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import YarnCard from "../shared/YarnCard";

import 'react-toastify/dist/ReactToastify.css';

export type Yarn = {
  id: string,
  num: string,
  color: string,
  weight: string,
  length: string
}

export enum InputEnum {
  Id = 'id',
  Num = 'num',
  Color = 'color',
  Weight = 'weight',
  Length = 'length',
}


function Index() {
  const { state } = useAuthState();
  const [yarns, setYarns] = useState<Array<Yarn>>([]);
  const firestore = useFirestore();
  const storage = useStorage();
  const [inputData, setInputData] = useState<Partial<Yarn>>({
    num: '',
    color: '',
    weight: '',
    length: '',
  });
  const [image, setImage] = useState("");
  const [formError, setFormError] = useState<boolean>(false);

  useEffect(() => {
    async function fetchData() {
      const yarnsCollection = collection(firestore, "yarns");
      const yarnsQuery = query(yarnsCollection);
      const querySnapshot = await getDocs(yarnsQuery);
      const fetchedData: Array<Yarn> = [];
      querySnapshot.forEach((doc) => {
        fetchedData.push({ id: doc.id, ...doc.data()} as Yarn);
      })
      setYarns(fetchedData);
    }
    fetchData();
  }, []);

  const onUpdateYarn =  (id: string, data: Partial<Yarn>) => {
    const docRef = doc(firestore, "yarns", id);

     updateDoc(docRef, data)
      .then(docRef => {
        toast.success('🧶 updated the yarn successfully!', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          });
      })
      .catch(error => {
        console.log(error)
      })
  }

  const handleInputChange = (field: InputEnum, value: string) => {
    setInputData({ ...inputData, [field]: value})
  }

  const handleImgChange = (e: React.FormEvent<HTMLFormElement>) => {
    setImage(e.target.files[0]);
  }

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const yarnsCollection = collection(firestore, "yarns");

      const newYarn: Partial<Yarn> = {
        num: inputData.num,
        color: inputData.color,
        weight: inputData.weight,
        length: inputData.length
      }

      const docRef = await addDoc(yarnsCollection, newYarn);

      toast.success('🧶 Saved the yarn successfully!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        });
      setYarns([...yarns,{ id: docRef.id, ...newYarn}]);
      setInputData({
        num: '',
        color: '',
        weight: '',
        length: ''
      })
    } catch(error) {
      setFormError(true);
    }
  }

  return (
    <>
      <Head title="TOP PAGE" />
      <div className="hero min-h-screen bg-slate-800">
        <div className="max-w-5xl mx-auto">
          <form className="flex items-center" onSubmit={handleFormSubmit}>
            <input 
              type="number" 
              onChange={(e) => handleInputChange(InputEnum.Num, e.target.value)} 
              value={inputData.num} 
              placeholder="0" 
              className="m-4 text-slate-50 bg-transparent border border-slate-700 focus:ring-slate-400 focus:outline-none p-4 rounded-lg"
               />
            <input 
              type="text" 
              onChange={(e) => handleInputChange(InputEnum.Color, e.target.value)} 
              value={inputData.color} 
              placeholder="color" 
              className="m-4 text-slate-50 bg-transparent border border-slate-700 focus:ring-slate-400 focus:outline-none p-4 rounded-lg"
               />
            <input 
              type="text" 
              onChange={(e) => handleInputChange(InputEnum.Weight, e.target.value)} 
              value={inputData.weight} 
              placeholder="weight(g)" 
              className="m-4 text-slate-50 bg-transparent border border-slate-700 focus:ring-slate-400 focus:outline-none p-4 rounded-lg" 
              />
            <input 
              type="text" 
              onChange={(e) => handleInputChange(InputEnum.Length, e.target.value)} 
              value={inputData.length} 
              placeholder="length(yds)" 
              className="m-4 text-slate-50 bg-transparent border border-slate-700 focus:ring-slate-400 focus:outline-none p-4 rounded-lg" 
              />
            <button type="submit" className="m-4 border border-purple-500 p-3 rounded-lg transition-opacity bg-purple-600 bg-opacity-30 hover:bg-opacity-50 text-slate-50">Add new yarn</button>
          </form>
          <div className="grid grid-cols-3 gap-4 w-full bg-transparent text-slate-50">
              {
                yarns.map((yarn) => (
                  <YarnCard key={yarn.id} yarn={yarn} onUpdate={onUpdateYarn} />
                ))
              }
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}

export default Index;
