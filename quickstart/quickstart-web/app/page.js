

import Link from 'next/link';
import Navbar from './navbar';

export default function Home() {
  return (
    <div>
      <Navbar/>
    <main className="flex justify-center items-center h-screen">
      
      
    <div className="w-1/2 h-full my-4 flex flex-col bg-red-100">
    <section className="w-full my-52 h-1/2 my-4 flex flex-col bg-white p-8"> 
    <div className="text-center">
            <h1 className="text-5xl my-8 font-bold mb-4 text-red-400">Kavach</h1>
            <p className="text-lg my-8">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut vehicula nunc nec libero molestie, et cursus tortor vehicula.</p>
            <Link href='http://127.0.0.1:4455/.factly/quickstart/blog'>
            <button className="bg-green-500 hover:bg-green-700 text-white font-bold my-8 py-2 w-1/3 rounded">Visit Us</button> </Link>
        </div>
    </section>
</div>

      
      
<div className="w-1/2 h-full my-4 flex flex-col ">
    <section className="w-full my-52 h-1/2 my-4 flex flex-col bg-gray-100 mx-8"> 
    
</section> </div>
  
    </main>
    </div>
    
  );
}
