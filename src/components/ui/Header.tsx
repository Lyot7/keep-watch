import React from "react";

const Header: React.FC = () => {
  return (
    <header className="absolute top-4 w-full bg-background p-8 rounded-full">
      <ul>
        <li><a href="#">Accueil</a></li>
        <li><a href="#">Projets</a></li>
        <li><a href="#">Contact</a></li>
        <li><a href="#">Veille</a></li>
      </ul>
    </header>
  );
};

export default Header;
