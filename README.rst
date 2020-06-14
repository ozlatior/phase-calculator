Phase Calculator for celestial objects
======================================

The purpose of this application is to keep track of "phases" of different celestial object
configurations for observation purposes. This was coded mostly to predict when certain configurations
are going to be visible so they can be photographed for a timelapse, but it can be used to predict
eclipses, occultations, conjunctions and other such cosmic events (with limitations, since it assumes
circular orbits for now - this would have to be extended for better accuracy in such applications).

Its main purpodr is to map the configuration of multiple orbiting bodies in "phases". For example, for
two moons orbiting a planet with rations of 1:2 (orbital resonance), the same phases will occur after
a full rotation of the second moon, when the two bodies will be in the same relative positions.

This application maps the relative positions of such objects to a phase space and gives each configuration
a number, as if they were continuously observed. It the calculates when the same configuration will be
visible again and again and allows the user to keep track of the observations made, so it's possible
to know what configurations are still missing from the collection and when to expect them to happen.

To install run the `install.sh` script. This is important because the application has some dependencies which
have to be pulled from github (not on npm yet).

Run `node cmd.js help` for a list of commands and how to use them. There will be a dedicated documentation
hopefully soon.
