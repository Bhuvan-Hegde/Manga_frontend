import { useEffect, useState } from 'react';
import { supabase } from '../Service/supabaseClient';
import { FaBook, FaCheckCircle, FaTrashAlt, FaRegClock } from 'react-icons/fa';
import { MdEdit, MdDelete } from "react-icons/md";


const initialForm = {
  name: '',
  totalChapters: 0,
  completedChapters: 0,
  comment: '',
  status: 'To_Read',
  releaseStatus: 'ONGOING',
  userId: 1,
  coverImage: null,
};

const BASE_URL = 'https://manga-springboot.onrender.com/api';

export default function ListPage() {
  const [mangas, setMangas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [imagePreview, setImagePreview] = useState(null);

  const fetchMangas = async () => {
    try {
      const res = await fetch(`${BASE_URL}/manga`);
      const data = await res.json();
      setMangas(data);
    } catch (err) {
      setError('Failed to fetch mangas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMangas();
  }, []);

  const openCreateForm = () => {
    setIsEdit(false);
    setFormData(initialForm);
    setImagePreview(null);
    setShowForm(true);
  };

  const openEditForm = (manga) => {
    setIsEdit(true);
    const { id, ...rest } = manga;
    setFormData({ ...rest, id });
    setImagePreview(manga.coverImage);
    setShowForm(true);
  };

  const handleImageUpload = async (file) => {
    if (!file) return null;
    const filePath = `manga-${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage.from('manga-covers').upload(filePath, file);
    if (error) {
      console.error('Image upload error:', error.message);
      alert('Image upload failed');
      return null;
    }
    return supabase.storage.from('manga-covers').getPublicUrl(filePath).data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isEdit ? `${BASE_URL}/manga/${formData.id}` : `${BASE_URL}/manga`;
    const method = isEdit ? 'PUT' : 'POST';
    const payload = { ...formData };

    if (isEdit) delete payload.userId;

    // Upload new image if a file is selected
    if (formData.coverImage instanceof File) {
      const imageUrl = await handleImageUpload(formData.coverImage);
      if (!imageUrl) {
        alert('Image upload failed');
        return;
      }
      payload.coverImage = imageUrl;
    } else {
      // Use existing image URL
      payload.coverImage = formData.coverImage;
    }

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      fetchMangas();
      setShowForm(false);
    } else {
      alert('Error saving manga');
    }
    console.log('Submitting payload:', payload);

  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this manga?')) return;
    await fetch(`${BASE_URL}/manga/${id}`, { method: 'DELETE' });
    fetchMangas();
  };

  return (
    <div className="p-6 w-[100vw] h-full min-h-screen bg-gray-50 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manga List</h1>
        <button onClick={openCreateForm} className="bg-green-600 text-white px-5 py-2 rounded shadow hover:bg-green-700 transition">
          + Add Manga
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
      <div className='grid grid-cols-2 gap-3 p-4 text-center sm:flex sm:flex-wrap sm:justify-center'>
        {mangas.map((m) => (
        <div className='flex flex-col justify-start items-center max-w-[180px] w-full relative'>
            <div className='w-full h-[250px]'>
              <img
                src={m.coverImage}
                alt="Manga Cover"
                className="w-full h-full object-cover rounded"
              />
            </div>
            <p className='font-[Inter] text-sm/5 text-gray-900'>{m.name}</p>
            <p className='font-[Inter] text-black font-bold bg-white px-1 rounded-lg text-[10px] absolute top-1 right-1'>{m.completedChapters} / {m.totalChapters}</p>
            <p className='absolute text-black font-bold text-[9px] p-[2px] px-[4px] left-1 rounded-lg bg-white top-1'>{m.releaseStatus}</p>
            <div className="text-[13px] flex gap-1 items-center bg-white absolute top-[200px] sm:top-[225px] right-[-9px] px-1 pr-3 rounded-md">
              {m.status === 'Reading' && (
                <>
                  <FaBook className="text-blue-500" />
                  <span>Reading</span>
                </>
              )}
              {m.status === 'Completed' && (
                <>
                  <FaCheckCircle className="text-green-600" />
                  <span>Completed</span>
                </>
              )}
              {m.status === 'Dropped' && (
                <>
                  <FaTrashAlt className="text-red-500" />
                  <span>Dropped</span>
                </>
              )}
              {m.status === 'To_Read' && (
                <>
                  <FaRegClock className="text-red-500" />
                  <span>To Read</span>
                </>
              )}
            </div>
          
          <div className="mt-3 flex gap-1 absolute top-[207px] left-1">
              <button
                onClick={() => handleDelete(m.id)}
                className="bg-white rounded-xl p-[5px] text-[15px]"
              >
                <MdDelete />
              </button>
              <button
                onClick={() => openEditForm(m)}
                className="bg-white rounded-xl p-[5px] text-[15px]"
              >
                <MdEdit />
              </button>
          </div>

          </div>
          
        ))}
        
      </div>




      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 max-h-[90%] rounded-xl w-[95%] max-w-md shadow-lg relative">
            <button onClick={() => setShowForm(false)} className="absolute top-2 right-3 text-2xl text-gray-600 hover:text-black">×</button>
            <h2 className="text-2xl font-bold mb-4 text-center">{isEdit ? 'Edit Manga' : 'Create Manga'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-medium">Name</label>
                <input type="text" className="w-full border rounded p-2" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block font-medium">Total Chapters</label>
                  <input type="number" className="w-full border rounded p-2" value={formData.totalChapters} onChange={(e) => setFormData({ ...formData, totalChapters: parseInt(e.target.value) })} required />
                </div>
                <div className="flex-1">
                  <label className="block font-medium">Completed</label>
                  <input type="number" className="w-full border rounded p-2" value={formData.completedChapters} onChange={(e) => setFormData({ ...formData, completedChapters: parseInt(e.target.value) })} required />
                </div>
              </div>
              <div>
                <label className="block font-medium">Comment</label>
                <textarea className="w-full border rounded p-2" value={formData.comment} onChange={(e) => setFormData({ ...formData, comment: e.target.value })} />
              </div>
              <div>
                <label className="block font-medium">Status</label>
                <select className="w-full border rounded p-2" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                  <option value="To_Read">To_Read</option>
                  <option value="Reading">Reading</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block font-medium">Release Status</label>
                <select className="w-full border rounded p-2" value={formData.releaseStatus} onChange={(e) => setFormData({ ...formData, releaseStatus: e.target.value })}>
                  <option value="ONGOING">ONGOING</option>
                  <option value="FINISHED">FINISHED</option>
                </select>
              </div>
              <div>
                {!isEdit && (
                  <div>
                                  <label className="block font-medium">Cover Image</label>
                <input type="file" className="w-full border rounded p-2" accept="image/*" onChange={(e) => {
                  const file = e.target.files[0];
                  setFormData({ ...formData, coverImage: file });
                  setImagePreview(URL.createObjectURL(file));
                }} />
                  </div>
                )}
         
              </div>

          
              
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
                {isEdit ? 'Update' : 'Create'}
              </button>
            </form>
          </div>
        </div>
      )}


      <div>
      
      </div>
    </div>
  );
}
