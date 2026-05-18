// Use https://gorest.co.in/ REST API for Testing and Prototyping
// Write function to fetch data from https://gorest.co.in/public/v2/users
// This function should print in console array of obects with the following structure {id, name, email}
// and handle possible errors 

// put your code here

// 1. Створюємо асинхронну функцію
async function fetchUsers() {
    try {
        // 2. Робимо запит до API
        const response = await fetch('https://gorest.co.in/public/v2/users');

        // 3. Перевіряємо, чи запит успішний
        if (!response.ok) {
            throw new Error(`Помилка сервера: ${response.status}`);
        }

        // 4. Перетворюємо відповідь у JSON
        const data = await response.json();

        // 5. Форматуємо дані (залишаємо тільки потрібні поля)
        const formattedUsers = data.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email
        }));

        // 6. Виводимо результат
        console.log('Список користувачів:');
        console.table(formattedUsers); // console.table виведе красиву табличку

    } catch (error) {
        // 7. Обробляємо помилки (наприклад, відсутність інтернету)
        console.error('Сталася помилка:', error.message);
    }
}

// Запускаємо функцію
fetchUsers();
