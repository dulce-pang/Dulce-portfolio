import { useState } from "react";
import { Yarn, InputEnum } from "../screens/Index";
import { PencilSquareIcon, CheckIcon, XCircleIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface YarnCardProps {
    yarn: Yarn,
    onUpdate: (data: Partial<Yarn>) => void
}


const YarnCard = ({ yarn, onUpdate }: YarnCardProps) => {
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [inputData, setInputData] = useState<Partial<Yarn>>(yarn);
    

    const toggleIsEdit = () => setIsEdit(prevIsEdit => !prevIsEdit);

    const onClose = () => {
        setIsEdit(false);
        setInputData(yarn);
    }

    const handleInputChange = (field: InputEnum, value: string) => {
        setInputData({ ...inputData, [field]: value})
      }

      const handleUpdate = () => {
        setIsEdit(false);
        onUpdate(yarn.id, inputData);
      }

    const inputClasses = clsx(
        'bg-transparent',
        'border-0',
        'py-2',
        'px-4',
        'rounded-md',
        !(yarn.color == 'black') ? 'text-black' : 'text-white'
    )

    const cardContainerClasses = clsx(
      'h-48',
      'group', 
      'relative', 
      'rounded-md',
      'flex',
      'flex-col', 
      'justify-between',
      'shadow-slate-900',
      'shadow-md',
      'p-4',
      !(yarn.color == 'black') ? 'text-black' : 'text-white'
    )

    const getData = function getData(color : string) {
      // note: does not work because of rate limiting
      // const url = "https://api.color.pizza/v1/names/?name=forest%20green";
      const url = `https://api.color.pizza/v1/names/?name=${color}`;
      try {
        const request = new XMLHttpRequest();
        request.open("GET", url, false); // `false` makes the request synchronous
        request.send(null);

        if (request.status === 200) {
          console.log(request.responseText);
        }
        else {
          throw new Error(`Response status: ${JSON.stringify(request)}`);
        }

        const result = JSON.parse(request.responseText);
        console.log(result);
        console.log(result.colors[0].hex);
        return result.colors[0].hex;
      } catch (error) {
        console.error(error.message);
        return color;
      }
    }

    const fetchData = async function fetchData(color : string) {
      // note: does not work because of rate limiting
      // const url = "https://api.color.pizza/v1/names/?name=forest%20green";
      const url = `https://api.color.pizza/v1/names/?name=${color}`;
      try {
        const response = await fetch(url);
        if (!response.ok) {
          console.log(`error: Response status: ${response.status}`);
          return color;
        }

        const result = await response.json();
        console.log(result);
        console.log(result.colors[0].hex);
        return result.colors[0].hex;
      } catch (error) {
        console.error(error.message);
        return color;
      }

        
    }

    const returnColor =  () => {
      var color = yarn.color;

      // use default
      if(!color){
        color = "slate"
      }
      else{
        // sanitize input
        color = color.toLowerCase();
        color = color.trim();
      }


      // return  getData(color);
      return fetchData(color).then((result) => {return result;});
    }

    

    return (
        <div key={yarn.id} className={
            clsx(cardContainerClasses
            )
            }
            style={{backgroundColor:  returnColor()}} >
          <h1>Yarn Card</h1>
        <div>
          <input className={
            clsx(inputClasses,
                "text-xl mb-2 font-bold",
                 {
                'bg-gray-900': isEdit,
                'cursor-text': isEdit
              })
            } 
            value={inputData.color} 
            onChange={(e) => handleInputChange(InputEnum.Color, e.target.value)}
            />
          <input className={clsx(inputClasses, {
            'bg-gray-900': isEdit,
            'cursor-text': isEdit
          })} 
          value={inputData.weight}
          onChange={(e) => handleInputChange(InputEnum.Weight, e.target.value)}
          />
        </div>
        <input className={
            clsx(inputClasses, 
                {
                'bg-gray-900': isEdit,
                'cursor-text': isEdit
              })
            } 
            value={yarn.length}
            onChange={(e) => handleInputChange(InputEnum.Length, e.target.value)}
             />
        {
            isEdit ?
            <>        
                <CheckIcon onClick={handleUpdate} className="h-6 w-6 text-green-500 absolute top-4 right-12 cursor-pointer" />
                <XCircleIcon onClick={onClose} className="h-6 w-6 text-red-900 absolute top-4 right-4 cursor-pointer" />
            </> :
            <button className="btn btn-active btn-ghost hidden group-hover:block absolute top-4 right-4 p-0" onClick={toggleIsEdit}>
            <PencilSquareIcon className="h-6 w-6 text-slate-50 cursor-pointer" />
            </button>
    }
    </div>
    )
    }

export default YarnCard;