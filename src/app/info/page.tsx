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
    photo: "/photos/hugo.jpg",
  },
];

const InfoPage = () => {
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
          d'indexation et de recherche multimédia en utilisant des ressources
          Cloud ou Edge.
        </p>
        <p>
          Notre application permet de rechercher des images similaires à partir
          d'une image de référence. Pour ce faire, nous devons extraire des
          caractéristiques des images et les comparer pour trouver les images
          les plus proches.
        </p>
        <p>
          Cette application est capable de gérer un grand nombre d'images et de
          fournir des résultats de recherche en temps réel.
        </p>
        <p>
          De plus, notre application est accessible via une interface Web simple
          et intuitive.
        </p>
      </div>
      <div className="info-container">
        <h1>Équipe</h1>
        <div className="team-container">
          {teamMembers.map((member, index) => (
            <div key={index} className="team-member">
              <img
                className="[overflow-clip-margin:unset]"
                src={member.photo}
                alt={member.name}
              />
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
