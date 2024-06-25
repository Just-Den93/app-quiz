document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modal');
    const modalContent = document.querySelector('.modal-content');
    const closeButton = document.querySelector('.close-button');
    const contentContainer = document.getElementById('content-container');
    const endMessage = document.getElementById('end-message');
    const endMessageContent = document.querySelector('.end-message-content');
    const restartButton = document.getElementById('restart-button');
    let contentText, startTimerButton, answerButton, selectCategoryButton, timerElement;
    let timerInterval;

    restartButton.addEventListener('click', () => {
        localStorage.clear(); // Clear the local storage
        endMessage.style.display = 'none'; // Hide the end message
        contentContainer.innerHTML = ''; // Clear the content container
        loadCategoriesFromData(); // Reload the categories
        location.reload(); // Optionally, reload the page to reset the state
    });

    function startTimer() {
        let totalSeconds = 30;

        timerInterval = setInterval(() => {
            if (totalSeconds > 0) {
                totalSeconds--;
            }
            const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
            const seconds = String(totalSeconds % 60).padStart(2, '0');
            timerElement.innerHTML = `
                <span>${minutes.charAt(0)}</span>
                <span>${minutes.charAt(1)}</span>
                <span class="colon">:</span>
                <span>${seconds.charAt(0)}</span>
                <span>${seconds.charAt(1)}</span>
            `;

            if (totalSeconds <= 3) {
                timerElement.querySelectorAll('span:not(.colon)').forEach(span => {
                    span.style.animation = 'blink 1s infinite';
                });
            } else {
                timerElement.querySelectorAll('span:not(.colon)').forEach(span => {
                    span.style.animation = 'none';
                });
            }

            if (totalSeconds <= 0) {
                clearInterval(timerInterval);
                timerElement.querySelectorAll('span:not(.colon)').forEach(span => {
                    span.style.animation = 'none';
                });
                setTimeout(() => {
                    timerElement.style.visibility = 'hidden'; // Hide the timer
                    setTimeout(() => {
                        showAnswerButton(); // Show the button after timer disappears
                        modalContent.removeChild(timerElement);
                    }, 300);
                }, 500);
            }
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
    }

    function loadCategoriesFromData() {
        contentContainer.innerHTML = ''; // Clear existing content

        data.forEach(category => {
            const categoryRow = document.createElement('div');
            categoryRow.classList.add('category-row');
            categoryRow.innerHTML = `
                <div class="category-name" id="category-${category.id}">${category.name}</div>
                <div class="items" id="items-${category.id}"></div>
            `;
            contentContainer.appendChild(categoryRow);

            const itemsContainer = document.getElementById(`items-${category.id}`);
            for (let i = 0; i < 9; i++) { // Change number of blocks to 9
                const button = document.createElement('button');
                button.classList.add('item');
                button.setAttribute('data-item', `${category.id}-${i}`);
                button.textContent = (i + 1).toString();
                itemsContainer.appendChild(button);
            }
        });

        document.querySelectorAll('.item').forEach(item => {
            const itemId = item.getAttribute('data-item');
            if (localStorage.getItem(itemId) === 'used') {
                item.classList.add('used');
            }

            item.addEventListener('click', () => {
                const itemId = item.getAttribute('data-item');
                const [categoryId, blockId] = itemId.split('-');
                const block = data[categoryId].blocks[blockId];

                // Clear previous content
                if (contentText) {
                    contentText.remove();
                }
                if (timerElement) {
                    timerElement.remove();
                }
                if (startTimerButton) {
                    startTimerButton.remove();
                }

                contentText = document.createElement('div');
                contentText.classList.add('content-text');
                contentText.setAttribute('data-item', itemId);
                contentText.innerHTML = block ? block.question : 'Питання';
                modalContent.appendChild(contentText);

                const questionCircle = document.createElement('div');
                questionCircle.classList.add('question-circle');
                questionCircle.innerHTML = `<span class="question-mark">?</span>`;
                contentText.appendChild(questionCircle);

                hideAnswerButton();
                hideSelectCategoryButton();

                modal.style.display = 'block';
                setTimeout(() => {
                    modal.style.opacity = '1';
                    modalContent.classList.add('show');
                }, 10);

                showStartTimerButton();
            });
        });

        // Check category completion on load
        data.forEach(category => {
            checkCategoryCompletion(category.id);
        });

        // Check overall completion on load
        checkOverallCompletion();
    }

    function hideAnswerButton() {
        if (answerButton) {
            answerButton.remove();
            answerButton = null;
        }
    }

    function hideSelectCategoryButton() {
        if (selectCategoryButton) {
            selectCategoryButton.remove();
            selectCategoryButton = null;
        }
    }

    function hideStartTimerButton() {
        if (startTimerButton) {
            startTimerButton.remove();
            startTimerButton = null;
        }
    }

    function showAnswerButton() {
        answerButton = document.createElement('button');
        answerButton.id = 'answer-button';
        answerButton.classList.add('answer-button', 'show');
        answerButton.textContent = 'Показати відповідь';
        answerButton.style.opacity = '1';
        modalContent.appendChild(answerButton);

        answerButton.addEventListener('click', () => {
            const itemId = contentText.getAttribute('data-item');
            const [categoryId, blockId] = itemId.split('-');
            const block = data[categoryId].blocks[blockId];

            contentText.innerHTML = block ? block.answer : 'Відповідь';
            hideAnswerButton();
            showSelectCategoryButton();

            const answerCircle = document.createElement('div');
            answerCircle.classList.add('question-circle');
            answerCircle.innerHTML = `<img src="./png/lightbulb-exclamation-svgrepo-com.svg" class="answer-button-icon" alt="?">`;
            contentText.appendChild(answerCircle);

            if (block && block.subAnswer) {
                const subAnswer = document.createElement('div');
                subAnswer.classList.add('sub-answer');
                subAnswer.textContent = block.subAnswer;
                contentText.appendChild(subAnswer);
            }

            const clickedItem = document.querySelector(`[data-item="${itemId}"]`);
            clickedItem.classList.add('used');
            localStorage.setItem(itemId, 'used');
            checkCategoryCompletion(categoryId);
            checkOverallCompletion();
        });
    }

    function checkCategoryCompletion(categoryId) {
        const items = document.querySelectorAll(`#items-${categoryId} .item`);
        const allUsed = Array.from(items).every(item => item.classList.contains('used'));

        if (allUsed) {
            const categoryName = document.querySelector(`#category-${categoryId}`);
            categoryName.classList.add('used');
            localStorage.setItem(`category-${categoryId}`, 'used');
        }
    }

    function checkOverallCompletion() {
        const allCategories = document.querySelectorAll('.category-name');
        const allUsed = Array.from(allCategories).every(category => category.classList.contains('used'));

        if (allUsed) {
            showEndMessage();
        }
    }

    function showEndMessage() {
        endMessage.style.display = 'flex';
        endMessage.style.opacity = '1';

        // Add the restart image inside the end message content
        const restartCircle = document.createElement('div');
        restartCircle.classList.add('restart-circle');
        restartCircle.innerHTML = `<img src="./png/award-svgrepo-com.svg" alt="award">`;
        endMessageContent.appendChild(restartCircle);

        // Start the Fireworks animation
        startConfetti();

        setTimeout(() => {
            endMessage.querySelector('button').style.visibility = 'visible';
            endMessage.querySelector('button').style.opacity = '1';
        }, 1000); // Change from 3 to 1 second
    }

    function showSelectCategoryButton() {
        selectCategoryButton = document.createElement('button');
        selectCategoryButton.id = 'select-category-button';
        selectCategoryButton.classList.add('select-category-button', 'show');
        selectCategoryButton.textContent = 'Обрати категорію';
        selectCategoryButton.style.opacity = '1';
        modalContent.appendChild(selectCategoryButton);

        selectCategoryButton.addEventListener('click', () => {
            modalContent.classList.remove('show');
            modal.style.opacity = '0';
            setTimeout(() => {
                modal.style.display = 'none';
                hideSelectCategoryButton();
            }, 300);
        });
    }

    function showStartTimerButton() {
        startTimerButton = document.createElement('button');
        startTimerButton.id = 'start-timer-button';
        startTimerButton.classList.add('start-timer-button', 'show');
        startTimerButton.innerHTML = `<img src="./png/refresh-ccw-clock-svgrepo-com.svg" alt="Start Timer" class="start-button-icon">`;
        startTimerButton.style.opacity = '1';
        modalContent.appendChild(startTimerButton);

        startTimerButton.addEventListener('click', () => {
            hideStartTimerButton();
            showTimer();
            startTimer();
            stopConfetti();
        });
    }

    function showTimer() {
        timerElement = document.createElement('div');
        timerElement.classList.add('timer');
        timerElement.id = 'timer';
        timerElement.innerHTML = `
            <span>00</span>
            <span class="colon">:</span>
            <span>30</span>
        `;
        timerElement.style.color = '#7958af';
        timerElement.style.animation = 'none';
        timerElement.style.visibility = 'visible';
        timerElement.style.opacity = '1';
        modalContent.appendChild(timerElement);
    }

    closeButton.addEventListener('click', () => {
        stopTimer();
        modalContent.classList.remove('show');
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            stopTimer();
            modalContent.classList.remove('show');
            modal.style.opacity = '0';
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    });

    loadCategoriesFromData();
});
