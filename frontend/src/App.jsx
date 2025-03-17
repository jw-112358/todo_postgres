import { useEffect, useState } from 'react';
import './App.css';

function App() {
	const [tasks, setTasks] = useState([]);
	const [title, setTitle] = useState('');

	useEffect(() => {
		fetch('http://localhost:3050/liste_abrufen') // fe -> be
			.then((res) => res.json())  
			.then(setTasks);
	}, []);

	const itemHinzufuegen = () => {
		if (!title) {
			return;
		}
		fetch('http://localhost:3050/add', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ title }),
		})
			.then((res) => res.json())
			.then((neueAufgabe) => setTasks([...tasks, neueAufgabe]));
		setTitle('');
	};

	const itemLoeschen = (id_nummer) => {
		fetch(`http://localhost:3050/delete/${id_nummer}`, {
			method: 'DELETE',
		})
			.then((res) => res.json())
			.then((resjson) =>
				tasks.filter((singleTask) => singleTask.id != resjson.id)
			)
			.then((filteredTasks) => setTasks(filteredTasks));
	};

	return (
		<>
			<h1>To-Do List</h1> 
			<input value={title} onChange={(e) => setTitle(e.target.value)} />
			<button disabled={!title.trim()} onClick={itemHinzufuegen}>
				Add
			</button>{' '}
			<ul>
				{
					tasks.map(({ id, title, completed }) => (
						<li key={id}>
							<input type="checkbox" />
							{title}
							<button onClick={() => itemLoeschen(id)}>X</button>
						</li>
					))
				}
			</ul>
		</>
	);
}

export default App;