

1. Fill up your name, and other details at indicated places in the
    prop.tex file.

2.  Type in your document divided into sections, and subsections as required.
    A sample name for the first section is shown. The label allows you to refer
    to the unit from other parts of the text using \ref{label}.

3. The prop.bib file should be modified to contain your references.
    Samples are given in the file. The references are cited using \cite{key}.

4.  Figures can be drawn in xfig or dia/gnuplot and included in the eps format.
Read documentation on LaTex to  learn how to include eps figures.

5. Run the commands from terminal in the order given below for the first time and
later whenever you modify the bib file

pdflatex prop
bibtex prop
pdflatex prop
pdflatex prop


If the bibfile is not modified:
pdflatex prop
pdflatex prop

6. Print prop.pdf