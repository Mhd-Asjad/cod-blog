import React ,{useEffect, useState , useRef} from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import ImageTool from '@editorjs/image';
import CodeTool from '@editorjs/code';
import Quote from '@editorjs/quote';
import Embed from "@editorjs/embed";
import Nav from '../components/Nav';
import useApi from '../components/useApi';

function EditPost() {
    const {id} = useParams();
    const editorRef = useRef(null)
    const [title , setTitle] = useState('')
    const [loading , setLoading ] = useState(true)
    const api = useApi()
    const navigate = useNavigate()

    useEffect(() => {
        const fetchPost = async () => {
            try {
            const response = await api.get(`posts/show-post/${id}/`);
            if (response.status === 200) {
                const data = response.data;
                setTitle(data.title)

                if (!editorRef.current) {

                    editorRef.current = new EditorJS({
                        holder : 'editorjs' ,
                        tools : {
                            header : {
                                class : Header ,
                                config : {placeholder : 'enter a Header', defaultlevel : 1},
                            },
                            image : {
                                class : ImageTool,
                                config : {
                                    endpoints : {
                                        byFile : 'http://localhost:8000/api/posts/upload-image/',
                                        byUrl: "http://localhost:8000/api/posts/fetch-url/",
                                    },
                                    field : 'image',
                                    types: "image/*",
                                },
                            },
                            code : {
                                class : CodeTool
                            },
                            embed : {
                                class: Embed,
                                config: {
                                    services: {
                                    youtube: true,
                                    instagram: true,
                                    },
                                },
                            },
                            qoute : {
                                class : Quote ,
                                config : {
                                    quotePlaceholder: 'Enter a quote',

                                }
                            }

                        },
                        data : response.data.content
                    })
                }

                console.log(data , 'setted data on post')
                console.log(`Fetched post data: ${JSON.stringify(response.data)}`);
            }

            } catch (error) {
            console.error(`Error while fetching the post: ${error}`);
            } finally {
            setLoading(false);
            }
        };
        
        fetchPost();

        return () => {
            if (editorRef.current){
                editorRef.current.destroy()
                editorRef.current = null;
            }
        }

    }, [id , api]);



    const handleSubmit = async(e) => {
        e.preventDefault()
        try {
            setLoading(true)
            const content = await editorRef.current.save()
            const payload = {
                'title' : title,
                'content' : content

            }
            
            const res = await api.put(`posts/edit-post/${id}/`,payload)
            if (res.status == 200) {

                navigate('/')
            }else {
                throw new Error('Failed to update post');

            }
        }catch(error) {
            console.log(error , 'error on blog edit')
        }finally{
            setLoading(false)
        }

    }
    
  return (
    <div className='h-screen overflow-auto bg-zinc-100 dark:bg-gray-800 transition-colors duration-300' >
        <Nav/>

        <div className='max-w-4xl mx-auto mt-8 dark:text-white p-4' >

            <form onSubmit={handleSubmit}>

            <div
                id="editorjs"
                className="rounded p-4 bg-white  dark:bg-gray-700 min-h-[200px]"
            >
                
            </div>
            <div className='flex justify-center' >

            <button
                type="submit"
                disabled={loading}
                className="mt-4 px-4 py-2 border-2 border-dashed dark:border-gray-700 dark:hover:bg-gray-600 border-black rounded cursor-pointer hover:bg-gray-100"
            >
                { loading ? 'saving...' : 'Save Changes'}
            </button>
            </div>

            </form>
        </div>


    </div>
  )
}

export default EditPost
