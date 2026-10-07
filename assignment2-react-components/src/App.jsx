import { useState } from "react";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Card from "./components/Card.jsx";
import Button from "./components/Button.jsx";
import Form from "./components/Form.jsx";

const links = [
  { href: "#cards", label: "Cards" },
  { href: "#counter", label: "Counter" },
  { href: "#contact", label: "Contact" },
];

const initialCards = [
  { id: 1, title: "HTML5 Semantic Structure", description: "Use header, main, section and footer for meaningful pages.", tag: "HTML" },
  { id: 2, title: "Flexbox and Grid", description: "Build responsive layouts without floats or hacks.", tag: "CSS" },
  { id: 3, title: "Props and State", description: "Props pass data down, state keeps data that changes.", tag: "React" },
];

function App() {
  const [cards, setCards] = useState(initialCards);
  const [count, setCount] = useState(0);
  const [messages, setMessages] = useState([]);

  const addCard = () => {
    const id = cards.length + 1;
    setCards([...cards, { id, title: `New Card ${id}`, description: "Added dynamically with state.", tag: "Demo" }]);
  };

  return (
    <>
      <Header title="React Practice" links={links} />
      <main className="container">
        <section id="cards">
          <h2>Cards (dynamic rendering)</h2>
          <div className="grid">
            {cards.map((c) => <Card key={c.id} {...c} />)}
          </div>
          <Button label="Add card" onClick={addCard} />
          <Button label="Remove last" variant="outline" onClick={() => setCards(cards.slice(0, -1))} disabled={cards.length === 0} />
        </section>

        <section id="counter">
          <h2>Button and event handling</h2>
          <p className="count">Count: {count}</p>
          <Button label="+1" onClick={() => setCount(count + 1)} />
          <Button label="-1" variant="outline" onClick={() => setCount(count - 1)} />
          <Button label="Reset" variant="danger" onClick={() => setCount(0)} />
        </section>

        <section id="contact">
          <h2>Form</h2>
          <Form onSubmit={(data) => setMessages([data, ...messages])} />
          {messages.length > 0 && (
            <div className="messages">
              <h3>Submitted messages</h3>
              <ul>
                {messages.map((m, i) => (
                  <li key={i}><strong>{m.name}</strong> ({m.email}): {m.message}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </main>
      <Footer name="Harsh Prajapati" />
    </>
  );
}
export default App;
