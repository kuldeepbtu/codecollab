function Card({ children }) {
  return (
    <div className="rounded-2xl bg-slate-800 p-8 shadow-xl">
      {children}
    </div>
  );
}

export default Card;