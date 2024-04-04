import Link from 'next/link';
import Sidebar from '../sidebar';

export default function Blog() {
  return (
    
    <div className="container mx-auto mt-10 grid grid-cols-6 gap-4">
      <div className="col-span-1">
        <Sidebar />
      </div>
      <div className="col-span-5">
        <div className="ml-4"> 
          
          <h1 className="text-4xl font-bold mx-4 my-8">Welcome to Kavach Guide Blog!</h1>
          <p className='text-lg my-4 mx-4'> Kavach is an open-source identity and access management solution. </p>
          <p className='text-lg my-4 mx-4'> It is a lightweight solution with features to manage organizations, users, permissions and can be configured easily to support applications requiring multitenancy. </p>
        <h2 className="text-3xl font-semibold mx-4 my-8">Main Features</h2>
        <p className='text-lg my-4 mx-4'> Some features which form main pillars of Kavach</p>
        <div className="flex justify-between mx-4 my-16">
        <div class="flex">
    <div class="box flex flex-col items-center justify-center bg-red-200 h-80 w-1/5 px-4 relative">
        <h2 class="text-xl font-bold mb-2 absolute top-8">Organization</h2>
        <span class="text-lg leading-relaxed mb-2 text-center">Creating or being part of an organisation is mandatory for accessing features of Kavach. Requirements- Title,Slug,Description,Logo</span>
        <button class="bg-white text-black font-bold py-2 px-4 rounded hover:bg-gray-200 transition duration-300 absolute bottom-8">Create Organization</button>
    </div>
    <div class="box flex flex-col items-center justify-center bg-red-200 h-80 w-1/5 mx-4 relative">
        <h2 class="text-xl font-bold mb-2 absolute top-8">Users</h2>
        <p class="text-lg mb-2 leading-relaxed text-center">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut vehicula nunc nec libero molestie, et cursus tortor vehicula.</p>
        <button class="bg-white text-black font-bold py-2 px-4 rounded hover:bg-gray-200 transition duration-300 absolute bottom-8">Button</button>
    </div>
    <div class="box flex flex-col items-center justify-center bg-red-200 h-80 w-1/5 mx-4 relative">
        <h2 class="text-xl font-bold mb-2 absolute top-8">Tokens</h2>
        <p class="text-lg mb-2 leading-relaxed text-center">Managed at all levels. Only owners have access to create, view or delete the tokens. </p>
        <button class="bg-white text-black font-bold py-2 px-4 rounded hover:bg-gray-200 transition duration-300 absolute bottom-8">Create Token</button>
    </div>
    <div class="box flex flex-col items-center justify-center bg-red-200 h-80 w-1/5 mx-4 relative">
        <h2 class="text-xl font-bold mb-2 absolute top-8">Roles </h2>
        <p class="text-lg mb-2 leading-relaxed text-center">Used to define functional categories of users. Two types of Roles- Default & Custom. Present at all the levels</p>
        <button class="bg-white text-black font-bold py-2 px-4 rounded hover:bg-gray-200 transition duration-300 absolute bottom-8">Create Role</button>
    </div>
    <div class="box flex flex-col items-center justify-center bg-red-200 h-80 w-1/5 mx-4 relative">
        <h2 class="text-xl font-bold mb-2 absolute top-8">Policies</h2>
        <p class="text-lg mb-2 leading-relaxed text-center">Controls which actions a role can perform on an entity. Consists of 3 things- Resource, Action, Roles</p>
        <button class="bg-white text-black font-bold py-2 px-4 rounded hover:bg-gray-200 transition duration-300 absolute bottom-8">Create Policy</button>
    </div>
</div>


          </div>
        </div>
      </div>
    </div>
  );
}
