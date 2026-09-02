const faqData = [
  {
    question: "Можно ли забронировать комнату онлайн?",
    answer: "Да, вы можете забронировать комнату через сайт."
  },
  {
    question: "Могут ли мне вернуть деньги за бронь?",
    answer: "Да можете, но возврат возможен за 24 часа до даты бронирования."
  },
  {
    question: "Какая комната самая популярная?",
    answer: "Самая популярная - квест \"Тюрьма\"."
  },
  {
    question: "Как получить VIP карту?",
    answer: "Её можно купить за 4500 рублей"
  },
  // {
  //   question: "Как получить VIP карту?",
  //   answer: "Её можно купить за 4500 рублей"
  // },
];

const renderFaq = (container) => {
  const faqContainer = document.createElement('div');
  faqContainer.className = 'faq';

  faqData.forEach(item => {
    const faqItem = document.createElement('div');
    faqItem.className = 'faq-item';

    const faqQuestion = document.createElement('div');
    faqQuestion.className = 'faq-question';
    faqQuestion.innerHTML = `
      ${item.question}
      <span class="plus"></span>
    `;

    const faqAnswer = document.createElement('div');
    faqAnswer.className = 'faq-answer';
    faqAnswer.textContent = item.answer;

    faqItem.append(faqQuestion);
    faqItem.append(faqAnswer);
    faqContainer.append(faqItem);
  });

  container.append(faqContainer);
};


const initAccordion = () => {
  renderFaq(document.body)
  const items = document.querySelectorAll(".faq-item");

  items.forEach(item => {
    item.querySelector(".faq-question").addEventListener("click", () => {
      items.forEach(el => {
        if (el !== item) el.classList.remove("active");
      });
      item.classList.toggle("active");
    });
  });
};

initAccordion();

