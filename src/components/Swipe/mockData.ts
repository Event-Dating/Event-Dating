import type { SwipeProfile } from './SwipeCard'

export const MOCK_PROFILES: SwipeProfile[] = [
	{
		id: '1',
		name: 'Анна',
		age: 23,
		gender: 'Женский',
		photo:
			'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
		description:
			'Люблю активный отдых и походы в горы. Ищу компанию для поездки на фестиваль!',
		tags: ['Спорт', 'Путешествия', 'Музыка'],
	},
	{
		id: '2',
		name: 'Алексей',
		age: 27,
		gender: 'Мужской',
		photo:
			'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
		description: 'Фанат джаза и крафтового пива. Буду рад новым знакомствам.',
		tags: ['Музыка', 'Еда', 'Кино'],
	},
	{
		id: '3',
		name: 'Мария',
		age: 21,
		gender: 'Женский',
		photo:
			'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=764&q=80',
		description: 'Учусь на дизайнера, обожаю выставки современного искусства.',
		tags: ['Культура', 'Кино', 'Прогулка'],
	},
	{
		id: '4',
		name: 'Дмитрий',
		age: 25,
		gender: 'Мужской',
		photo:
			'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
		description: 'Играю на гитаре, люблю настолки и квизы.',
		tags: ['Игры', 'Музыка', 'Спорт'],
	},
	{
		id: '5',
		name: 'Елена',
		age: 24,
		gender: 'Женский',
		photo:
			'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
		description: 'Веган, йога-инструктор. Ищу единомышленников.',
		tags: ['Спорт', 'Еда', 'Путешествия'],
	},
].map(p => ({ ...p, joinedEvents: ['1', '2', '3', 'all'] })) // 'all' для показа на любых ивентах при тесте
