import React, {useState, useEffect } from 'react';
import {TextField , Button } from '@mui/material';
import Task from './Task';
import './App.css';

import { TaskContractAddress } from './config.js';
import {ethers} from 'ethers';
import TaskAbi from './utils/TaskContract.json'


function App() {
  const [tasks,setTasks]=useState([]);
  const [input, setInput]=useState('');
  const [currentAccount, setCurrentAccount] = useState('');
  const [correctNetwork, setCorrectNetwork] = useState(false);
  
  const getAllTasks = async() => {
  try {
    const {ethereum} = window

    if(ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const TaskContract = new ethers.Contract(
        TaskContractAddress,
        TaskAbi.abi,
        signer
      )

      let allTasks = await TaskContract.getMyTasks();
      setTasks(allTasks);
    } else {
      console.log("Ethereum object doesn't exist");
    }
  } catch(error) {
    console.log(error);
  }
}
  
  useEffect(() => {
      getAllTasks()
    },[]);
    
    // Calls Metamask to connect wallet on clicking Connect Wallet button
  const connectWallet = async () => {
    try {
      const { ethereum } = window

      if (!ethereum) {
        console.log('Metamask not detected')
        return
      }
      let chainId = await ethereum.request({ method: 'eth_chainId'})
      console.log('Connected to chain:' + chainId)

      const sepoliaChainId = '0xaa36a7'

      if (chainId !== sepoliaChainId) {
        alert('You are not connected to the Sepolia Testnet!')
        return
      } else {
        setCorrectNetwork(true);
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })

      console.log('Found account', accounts[0])
      setCurrentAccount(accounts[0])
    } catch (error) {
      console.log('Error connecting to metamask', error)
    }
  }  
    
  const addTask= async (e)=>{
    e.preventDefault();

    let task = {
      'taskText': input,
      'isCompleted': false
    };

    try {
      const {ethereum} = window

      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const TaskContract = new ethers.Contract(
          TaskContractAddress,
          TaskAbi.abi,
          signer
        )

        TaskContract.addTask(task.taskText, false, currentAccount)
          .then(response => {
            setTasks([...tasks, task]);
            console.log("Completed Task");
          })

        .catch(err => {
          console.log("Error occured while adding a new task");
        });
        ;
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch(error) {
      console.log("Error submitting new Tweet", error);
    }

    setInput('')
  };
  
  const completeTask = key => async() => {
    console.log(key);

    try {
      const {ethereum} = window

      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const TaskContract = new ethers.Contract(
          TaskContractAddress,
          TaskAbi.abi,
          signer
        )

        let completeTaskTx = await TaskContract.completeTask(key);
        let allTasks = await TaskContract.getMyTasks();
        setTasks(allTasks);
      } else {
        console.log("Ethereum object doesn't exist");
      }

    } catch(error) {
      console.log(error);
    }
  }

  return (
    <div>
{currentAccount === '' ? (
  <button
  className='text-2xl font-bold py-3 px-12 bg-[#f1c232] rounded-lg mb-10 hover:scale-105 transition duration-500 ease-in-out'
  onClick={connectWallet}
  >
  Connect Wallet
  </button>
  ) : correctNetwork ? (
    <div className="App">
      <h2> Valuelabs test</h2>
      <form>
         <TextField id="outlined-basic" label="Make Todo" variant="outlined" style={{margin:"0px 5px"}} size="small" value={input}
         onChange={e=>setInput(e.target.value)} />
        <Button variant="contained" color="primary" onClick={addTask}  >Add Task</Button>
      </form>
      <ul>
          {tasks.map(item=> 
            <Task 
              key={item.id} 
              isCompleted={item.isCompleted}
              taskText={item.taskText} 
              onClick={completeTask(item.id)}
            />)
          }
      </ul>
    </div>
  ) : (
  <div className='flex flex-col justify-center items-center mb-20 font-bold text-2xl gap-y-3'>
  <div>----------------------------------------</div>
  <div>Please connect to the Sepolia Testnet</div>
  <div>and reload the page</div>
  <div>----------------------------------------</div>
  </div>
)}
</div>
  );
}

export default App;
