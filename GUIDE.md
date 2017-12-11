* [Introduction](#introduction)
* [Acknowledgements](#acknowledgements)
* [Guide](#guide)
* [References](#references)
* [Licenses](#licenses)
* [Appendix A: Event Logging](#appendix-a-event-logging)

# Introduction
For researchers of infant cognition and human development, Freeze Frame is an interactive computer application that provides experimental control of visual cues, animation and stimuli for scientific trials of early visual inhibition.

The software is derived from the behavior and code used in established research and supports data collection for a lab environment using Microsoft Windows 10. A detailed record of the experiment may be downloaded for review and analysis.

# Acknowledgements
Funding for the Freeze Frame software was supported by grant R03HD091644 from the Eunice Kennedy Shriver National Institute of Child Health and Human Development (NICHD/NIH) awarded to Martha Ann Bell. The content of this software and resulting research publications is solely the responsibility of the authors and does not necessarily represent the official view of the National Institutes of Health.

We are grateful that Karla Holmboe and Gergley Csibra shared their original Freeze Frame source code and stimuli with us. The [original Freeze Frame publication](http://doi.org/10.1016/j.jecp.2007.09.004) can be found in:

> Holmboe, K., Fearon, R. M. P., Csibra, G., Tucker, L. A., & Johnson, M. H. (2008). Freeze-Frame: A new infant inhibition task and its relation to frontal cortex tasks during infancy and early childhood. Journal of Experimental Child Psychology, 100, 89–114.

# Guide

## What is an experiment?
An experiment (also, 'Freeze Frame task') consists of multiple trials with a single subject, usually a child or infant, where the participant is positioned to view the software in order for an experimenter to log the subject's reactions to animated images and computer-controlled cues that appear randomly to one side of the image for a set cue duration. The experimenter is responsible for using keyboard controls to attract attention, to indicate that the subject made an action toward the cue, to control experimental conditions and to start or end the experiment.

Each experiment has a calibration phase that uses experimental settings to set the cue duration. See [How do I change the settings for the experiment?](#how-do-i-change-the-settings-for-the-experiment)

## What is a trial?
A trial will show animated images from a sequence of 'interesting' (varied) images or a 'boring' (repeated) image. A trial begins when the subject focuses on the animation as indicated by an experimenter key press (`CTRL`). The Freeze Frame software waits for one to two seconds before showing a cue (also, distractor) on the left or right of the image, chosen randomly. If the subject makes a saccade toward the distractor, the experimenter releases the `CTRL` key. Based on the timing of the subject's reactions, the animation may freeze, and the events recorded in the **Logging Window** and downloads will indicate whether the subject looked toward the cue.

## How do I start an experiment?
1. Start the Freeze Frame (2017) software or follow a link to the **Welcome Page** of the application.
1. If you will assign identifiers to your subjects (i.e., participants), use the **Subject ID** text box to associate that value for events recorded during the experiment.
1. Choose the **Start Freeze Frame** button to continue to the **Experiment Page**. The **Experiment Start Screen** has a button labeled _Start the experiment_.
1. Choose the **Experiment Start Button** to begin the experiment.

## How do I end an experiment?
1. On the **Experiment Page**, move your cursor to the top of the browser window to reveal the **Experiment Control Bar**.
1. Choose the **Finish Experiment** Button.

## How are the experiment's events recorded?
The experiment events are recorded as a series of events in CSV (Comma-Separated Values) format, a simple text format with each field delimited by commas. This common format is well-supported by spreadsheet software and various mathematical and statistical analysis tools.

Sample output:

"Time","Text","Trial","Trial Type","Item","Subject","Date"
1790,"EXPERIMENT STARTED",0,"","Experiment",,20171019081701070
1800,"Animation starts",0,"","Animation #34",,20171019081701084
4761,"Subject looks to cue",1,"Boring","Subject",,20171019081704044
…
22893,"EXPERIMENT ENDED",5,"Boring","Experiment",,20171019081722176

See [Appendix A: Event Logging](#appendix-a-event-logging) for a full example of events.

## How do I download a log of events?
1. On the **Experiment Page**, move your cursor to the top of the browser window to reveal the **Experiment Control Bar**.
1. End the experiment. If your experiment reaches the _Trial Criterion_ (See [How do I change the settings for the experiment?](#how-do-i-change-the-settings-for-the-experiment)), your experiment will end automatically. You may also choose the **Finish Experiment** Button for any in-progress experiment.
1. Choose the **Download CSV** Button. Your browser may prompt you for a location to save the file, and you can specify a location on your computer or device.

## How do I control the experiment?
Once you have started the experiment (see [How do I start an experiment?](#how-do-i-start-an-experiment)), the initial animated image will load in the center of the **Experiment Page**. Typically, an experimenter will choose to do one of the following tasks:

* **Start a trial.** See [How do I start a trial?](#how-do-i-start-a-trial)
* **Attract the attention of the subject.** See [How do I attract the attention of the subject?](#how-do-i-attract-the-attention-of-the-subject)
* **Set the Cue Duration.** See [How do I set the Cue Duration?](#how-do-i-set-the-cue-duration)
* **End the experiment.** See [How do I end an experiment?](#how-do-i-end-an-experiment)

## What keyboard shortcuts can I use?
On the **Experiment Page**…

| Shortcut | Action |
| :------: | ------ |
| `CTRL` | Start a trial. Press and hold as long as the subject is focused on the animation and release when the subject looks toward the cue. |
| `1` |    Grow and shrink the animated image. See [How do I attract the attention of the subject?](#how-do-i-attract-the-attention-of-the-subject) |
| `2` |    Spin the animated image in a spiral pattern. See [How do I attract the attention of the subject?](#how-do-i-attract-the-attention-of-the-subject) |
| `3` |    Show a colorful, rotating color wheel. See [How do I attract the attention of the subject?](#how-do-i-attract-the-attention-of-the-subject) |
| `A` |    Play a sound. See [How do I attract the attention of the subject?](#how-do-i-attract-the-attention-of-the-subject) |
| `P` |    Open the **Settings Dialog**. |
| `X` |    Set the Cue Duration manually instead of using the experimental settings from the **Settings Dialog** to calibrate the value. |
| `ESC` |    Dismiss a window or dialog (e.g., the **Settings Dialog**) if visible, without saving changes. |

## How do I start a trial?
1. Start a trial by pressing the `CTRL` key.
1. Hold the `CTRL` key down as long as the subject is focused on the animation.
1. Release the `CTRL` key if the subject looks toward the cue. You can keep holding the `CTRL` key down through multiple trials.

## How do I attract the attention of the subject?
You can attract the attention of the subject using visual or audio cues.

### Using Visual Cues
While on the **Experiment Page**, you can play one of three visual attractors using the numeric keys 1, 2 and 3.

1. Press the `1` key to shrink the animated image
1. Press the `2` key to spin the image in a spiral
1. Press the `3` key to rotate a colorful image, temporarily replacing the animation

The experimenter will use the the keyboard of the computer controlling the Freeze Frame (2017) software to trigger these visual cues.

### Using an Audio Cue
While on the **Experiment Page**, you can play a sound by pressing the `A` key to attract the attention or focus of the subject.

The experimenter will use the the keyboard of the computer controlling the Freeze Frame (2017) software to trigger the audio cue.

## How do I set the Cue Duration?
You can set the cue duration through the experiment's default calibration or set the cue duration manually, using the current value for all future trials.

### Using the Experiment's Calibration Defaults
The following settings are used to calibrate the cue duration for the experiment:
* Initial Cue Duration
* Cue Duration Increment
* Maximum Cue Duration
* Look Criterion

The _Initial Cue Duration_ sets the duration that the cue, or distractor, will appear after the subject focuses on the animation. When a trial does not result in a look or saccade, the cue duration is increased by the _Cue Duration Increment_, to a maximum value of _Maximum Cue Duration_. The cue duration is locked for all future trials whenever there are a consecutive number of looks to the cue that matches the _Look Criterion_ or when the maximum value is reached. For both of these cases, an event is recorded in the log.

### Setting the Cue Duration Manually
While an experiment is in-progress, you may press the `X` key to set the cue duration manually. All subsequent trials will use the current value.

## How do I set up my browser for running an experiment?
The original experiment by Holmboe, et. al., specified the visual angle for the size of the images, which can be changed to accommodate variations in the subject's distance to the monitor or computer display. You can configure your browser and lab environment to match a specific size using the **Distance Slider**.

On the **Experiment Page**, move your cursor to the top of the browser window to reveal the **Experiment Control Bar**.
Drag the handle on the **Distance Slider** to adjust the size of the animation, cues and relative sizes of images and other elements. The value will update as you make changes to indicate the current distance.

Related: [How do I toggle the units shown for the distance slider between centimeters and inches?](#how-do-i-toggle-the-units-shown-for-the-distance-slider-between-centimeters-and-inches)

## How do I toggle the units shown for the distance slider between centimeters and inches?
On the **Experiment Page**, move your cursor to the top of the browser window to reveal the **Experiment Control Bar**.
Hover your cursor over the **Distance Value** located to the side of the **Distance Slider** to read the converted amount. You can click on the **Distance Value** to toggle the units between _metric_ (cm) and _Imperial_ (in).

## How do I change the settings for the experiment?
On the **Experiment Page**, move your cursor to the top of the browser window to reveal the **Experiment Control Bar**.
Open the **Settings Dialog** by choosing the Settings Button.
Change the experiment settings (below) and choose **Save & Return** to restart the experiment with the new settings or **Cancel** to close the dialog. If you have made changes and need to restore the experimental defaults, you can choose the **Revert to Defaults** Button.

_Initial Cue Duration_: The starting cue duration in milliseconds. Default: 200 ms
_Cue Duration Increment_: The number of milliseconds to increase for each trial during the calibration. Default: 40 ms
_Maximum Cue Duration_: The maximum value for the number of milliseconds to show the cue. Default: 1200 ms
_Look Criterion_: The number of trials to use for calibration. Default: 2 trials
_Trial Criterion_: The number of trials to collect before ending the experiment. Default: 80 trials

## How do I open a secondary window for monitoring the experiment?
On the **Experiment Page**, move your cursor to the top of the browser window to reveal the **Experiment Control Bar**.
Open the **Logging Window** by choosing the **Open Logging Window** Button.

## How do I run the experiment so that it fills the entire screen?
On the **Experiment Page**, move your cursor to the top of the browser window to reveal the **Experiment Control Bar**.
Choose the **Enter Full Screen** Button to enter full-screen mode in the Freeze Frame (2017) software. Your browser or device may prompt you with instructions about exiting the full-screen mode—usually by pressing `ESC` on your keyboard.
When complete, you may reveal the **Experiment Control Bar** at the top of the browser window again and choose the **Exit Full Screen Button** to restore your normal view.

## How will I know how much disk space is used by CSV data?
On the **Welcome Page**, the **Version Information** line at the bottom of the window will list the version of the Freeze Frame (2017) software and the storage space used by the software.

For example, the following line would indicate that ~5KB is dedicated to storing settings and data from prior experiments:

v1.0.0 (2017) 5.00KB used

## What happens if I forget to save the CSV?
If you accidentally finish the experiment without saving the data, return to the **Welcome Page**. If there is a backup of the data, a **Recover CSV** button will be available on the page. Click or choose that button to download the missing experiment's data in CSV format.

## Why don't my keyboard presses work?
Your computer or device can only process the key presses for a window that has focus. If you are using multiple windows or are in full-screen mode, you may have unexpectedly made another window or application the primary window, which would capture all keyboard events and prevent the Freeze Frame (2017) application from knowing which keys were pressed or released.

You will always start the application using the **Experiment Start Button**. If you need to use another application or window, you should always give focus back to the window that contains the **Experiment Page** with your mouse or keyboard.

# References

## Welcome Page
* Subject ID & Start Freeze Frame
* Version Information
* Recover CSV

## Experiment Page

### Experiment Start Screen
*  Experiment Start Button

### Experiment Control Bar
* Distance Slider
* Distance Value
* Settings Button
* Finish Experiment Button
* Open Logging Window Button
* Enter Full Screen Button
* Exit Full Screen Button

### Settings Dialog
* Initial Cue Duration
* Cue Duration Increment
* Maximum Cue Duration
* Look Criterion
* Trial Criterion
* Revert to Defaults Button
* Save & Return

### Logging Window
* Subject ID
* Experiment Details
* Events Table
* Save Button

### Experiment Finish Screen
* Experiment Finish Button
* Download CSV Button

# Licenses
Freeze Frame (2017) uses open-source software and is available under the MIT license.

All trademarks are the property of their respective owners.

# Appendix A: Event Logging
The following is a sample of events logged for an experiment with an example subject named `A1`:

| Time | Text | Trial | Trial Type | Item | Subject | Date |
| :--: | ---- | :---: | ---------- | ---- | :-----: | ---- |
| 1790 | EXPERIMENT STARTED | 0 |  | Experiment | A1 | 20171019081701070 |
| 1800 | Animation starts | 0 |  | Animation #34 | A1 | 20171019081701084 |
| 5638 | Animation stops | 1 | Boring | Boring | A1 | 20171019081704920 |
| 5841 | Cue presented on the right side for 204 ms. | 1 | Boring | Cue | A1 | 20171019081705124 |
| 6458 | Subject looks to cue | 1 | Boring | Subject | A1 | 20171019081705744 |
| 8847 | Animation starts | 2 | Interesting | Animation #111 | A1 | 20171019081708130 |
| 8915 | Subject looks away | 2 | Interesting | Subject | A1 | 20171019081708200 |
| 9858 | Animation stops | 2 | Interesting | Animation #111 | A1 | 20171019081709144 |
| 10060 | Cue presented on the right side for 200 ms. | 2 | Interesting | Cue | A1 | 20171019081709344 |
| 10664 | Cue duration is set to 200 ms. | 2 | Interesting | Cue | A1 | 20171019081709948 |
| 13062 | Animation starts | 3 | Boring | Boring | A1 | 20171019081712344 |
| 14682 | Animation stops | 3 | Boring | Boring | A1 | 20171019081713970 |
| 14885 | Cue presented on the left side for 204 ms. | 3 | Boring | Cue | A1 | 20171019081714170 |
| 15488 | Animation continues | 3 | Boring | Boring | A1 | 20171019081714772 |
| 17892 | Animation starts | 4 | Interesting | Animation #40 | A1 | 20171019081717176 |
| 19341 | Animation stops | 4 | Interesting | Animation #40 | A1 | 20171019081718624 |
| 19547 | Cue presented on the left side for 205 ms. | 4 | Interesting | Cue | A1 | 20171019081718830 |
| 20143 | Animation continues | 4 | Interesting | Animation #40 | A1 | 20171019081719424 |
| 20845 | Subject looks away | 4 | Interesting | Subject | A1 | 20171019081720130 |
| 22544 | Animation starts | 5 | Boring | Boring | A1 | 20171019081721828 |
| 22893 | EXPERIMENT ENDED | 5 | Boring | Experiment | A1 | 20171019081722176 |
