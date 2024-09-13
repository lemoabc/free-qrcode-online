export function initUI() {
    const helpBtn = document.getElementById('helpBtn');
    const helpModal = document.getElementById('helpModal');
    const closeHelpBtn = document.getElementById('closeHelpBtn');

    helpBtn.addEventListener('click', () => {
        helpModal.classList.remove('hidden');
        helpModal.classList.add('flex');
    });

    closeHelpBtn.addEventListener('click', () => {
        helpModal.classList.add('hidden');
        helpModal.classList.remove('flex');
    });
}

export function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 px-4 py-2 rounded-md text-white ${type === 'error' ? 'bg-red-500' : 'bg-green-500'} transition-opacity duration-300`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('opacity-0');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}