---
title: "Une Approche Science des Données pour la Production d'Électricité en Occitanie"
team: 7
session: Semestre 2, 2021
coursecode: Marathon du Web
author: 
  - "Jérome Étudiant (123456), "
  - "Jeanine Dupont (ID), "
  - "Djamel Debouze (ID)." 
date: "25/07/2020"
Acknowledgements: 
Abstract: "Mon résumé."
output:
  pdf_document:
    template: template.tex
    md_extensions: +raw_attribute
    keep_md: true 
    keep_tex: true 
    pandoc_args:
    - --top-level-division="chapter"
    toc: true
    toc_depth: 1
    number_sections: true
---



\setcounter{chapter}{1}
\renewcommand\thesection{\arabic{section}}

## Introduction et Motivation {.label:s-intro}

Vous devez décrire le problème avec vos propres mots et motiver son importance. Votre description doit êter claire pour un lecteur qui n'est pas familier avec le problème (par exemple un étudiant de votre discipline mais qui n'est pas impliqué dans le cours, un autre professeur de votre école qui n'enseigne pas pour Le Marathon du Web). L'idée est que vous epxliquiez clairement ce que vous avez compris du problème après la présentation faite par les enseignants et après discussions avec le sponsor.

\bigskip

Ensuite, décrire brièvement comment vous prévoyez résoudre le problème (e.g., comparer plusieurs méthodologies existantes, appliquer des techniques statistiques spécifiques, etc.).

## Brève Revue de la Litérature

Citer les travaux que vous avez trouvés dans la litérature. Puisque vous êtes limités par l'espace, décrivez seulement les travaux les plus pertinents et discutez les connections avec votre travail. Décrivez les méthodes employées dans les travaux reliés, ainsi que les critères quantitatifs ou qualitatifs de succès de ces méthodes.



\bigskip

Afin d'incorporer vos références dans ce rapport, nous suggérons fortement d'utiliser BibTeX. Vos références doivent être enregistrées dans le fichier `references.bib`, et citées comme suit \cite{Lafaye2013}. 


## Méthodes, Logiciels et Description des Données

Vous devez décrire les techniques que vous prévoyez utiliser et pourquoi vous avez sélectionné ces techniques. Aussi, décrivez les logiciels et librairies que vous aurez besoin d'implémenter pour vos analyses. Vous pourrez revoir cela plus tard puisqu'il s'agit d'une proposition préliminaire. Finalement, fournissez une description claire des données (format, stockage, variables, taille, complexité) et sa pertinence pour le problème choisi.

## Activités et Planification

Lister les activités principales pour ce projet et créez un échéancier pour ces activités. Vous pouvez utiliser un diagramme de Gantt (voir page suivante).

\newpage

Voici un example créé en utilisant \LaTeX:


\definecolor{barblue}{RGB}{153,204,254}
\definecolor{groupblue}{RGB}{51,102,254}
\definecolor{linkred}{RGB}{165,0,33}
\renewcommand\sfdefault{phv}
\renewcommand\mddefault{mc}
\renewcommand\bfdefault{bc}
\setganttlinklabel{s-s}{START-TO-START}
\setganttlinklabel{f-s}{FINISH-TO-START}
\setganttlinklabel{f-f}{FINISH-TO-FINISH}
\sffamily
\begin{ganttchart}[
    canvas/.append style={fill=none, draw=black!5, line width=.75pt},
    hgrid style/.style={draw=black!5, line width=.75pt},
    vgrid={*1{draw=black!5, line width=.75pt}},
    today=7,
    today rule/.style={
      draw=black!64,
      dash pattern=on 3.5pt off 4.5pt,
      line width=1.5pt
    },
    today label font=\small\bfseries,
    title/.style={draw=none, fill=none},
    title label font=\bfseries\footnotesize,
    title label node/.append style={below=7pt},
    include title in canvas=false,
    bar label font=\mdseries\small\color{black!70},
    bar label node/.append style={left=2cm},
    bar/.append style={draw=none, fill=black!63},
    bar incomplete/.append style={fill=barblue},
    bar progress label font=\mdseries\footnotesize\color{black!70},
    group incomplete/.append style={fill=groupblue},
    group left shift=0,
    group right shift=0,
    group height=.5,
    group peaks tip position=0,
    group label node/.append style={left=.6cm},
    group progress label font=\bfseries\small,
    link/.style={-latex, line width=1.5pt, linkred},
    link label font=\scriptsize\bfseries,
    link label node/.append style={below left=-2pt and 0pt}
  ]{1}{13}
  \gantttitle[
    title label node/.append style={below left=7pt and -3pt}
  ]{WEEKS:\quad1}{1}
  \gantttitlelist{2,...,13}{1} \\
  \ganttgroup[progress=57]{WBS 1 Summary Element 1}{1}{10} \\
  \ganttbar[
    progress=75,
    name=WBS1A
  ]{\textbf{WBS 1.1} Activity A}{1}{8} \\
  \ganttbar[
    progress=67,
    name=WBS1B
  ]{\textbf{WBS 1.2} Activity B}{1}{3} \\
  \ganttbar[
    progress=50,
    name=WBS1C
  ]{\textbf{WBS 1.3} Activity C}{4}{10} \\
  \ganttbar[
    progress=0,
    name=WBS1D
  ]{\textbf{WBS 1.4} Activity D}{4}{10} \\[grid]
  \ganttgroup[progress=0]{WBS 2 Summary Element 2}{4}{10} \\
  \ganttbar[progress=0]{\textbf{WBS 2.1} Activity E}{4}{5} \\
  \ganttbar[progress=0]{\textbf{WBS 2.2} Activity F}{6}{8} \\
  \ganttbar[progress=0]{\textbf{WBS 2.3} Activity G}{9}{10}
  \ganttlink[link type=s-s]{WBS1A}{WBS1B}
  \ganttlink[link type=f-s]{WBS1B}{WBS1C}
  \ganttlink[
    link type=f-f,
    link label node/.append style=left
  ]{WBS1C}{WBS1D}
\end{ganttchart}

\bigskip

Voici un example créant au moyen de R:

![](upv-Marathon-du-Web-ChoixProbleme-rapport-template_files/figure-latex/unnamed-chunk-1-1.pdf)<!-- --> 


---
# References
---

\bibliographystyle{elsarticle-num}
\bibliography{references}


