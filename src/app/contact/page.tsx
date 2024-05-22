import React from "react";
import "../globals.css";
import "./InfoPage.css"; // Import the new CSS file

interface TeamMember {
  name: string;
  role: string;
  photo: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Rodrigue Deghorain",
    role: "Developper",
    photo: "/photos/rodrigue.jpg",
  },
  {
    name: "Hugo Lorenzoni",
    role: "Developer",
    photo: "photos/hugo.jpg",
  },
];

const InfoPage: React.FC = () => {
  return (
    <>
      <div className="info-container">
        <h1>Présentation du Projet : Cloud & Edge Computing 2023-2024</h1>
        <p>
          Bienvenue à notre projet pour le cours de Cloud & Edge Computing
          2023-2024, dirigé par Sidi Mahmoudi. Ce projet s'appuie sur les
          compétences acquises lors des cours et des travaux pratiques du
          module.
        </p>
      </div>
      <div className="info-container">
        <h1>Objectif du projet</h1>
        <p>
          Le projet a pour but de développer et héberger une application
          d’indexation et de recherche multimédia en utilisant des ressources
          Cloud ou Edge.
        </p>
      </div>
      <div className="info-container">
        <h1>Equipe</h1>
        <div className="team-container">
          {teamMembers.map((member, index) => (
            <div key={index} className="team-member">
              <img src={member.photo} alt={member.name} />
              <strong>{member.name}</strong> - {member.role}
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: "20px" }}></div>
    </>
  );
};

export default InfoPage;
