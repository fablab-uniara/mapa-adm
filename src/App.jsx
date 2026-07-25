import { useState, useMemo, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, collection, getDocs, addDoc, deleteDoc, setDoc } from "firebase/firestore";

// Nossos super hooks modulares
import { useAuth } from './hooks/useAuth';
import { useCourseData } from './hooks/useCourseData';
import { useStudentProgress } from './hooks/useStudentProgress';
import GestaoCursoView from './components/GestaoCursoView';
// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB0FyCOLcmvumfVo_Izro5-68zjWXr9qT8",
  authDomain: "mapa-adm-uniara.firebaseapp.com",
  projectId: "mapa-adm-uniara",
  storageBucket: "mapa-adm-uniara.firebasestorage.app",
  messagingSenderId: "78594989475",
  appId: "1:78594989475:web:91215cde349a2f57b68e16"
};
const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);

const LOGO_B64 = "data:image/gif;base64,R0lGODdhyADIAOcAAAyO0xym5sSvv5TZ7MxOTFyq1Mzo9FzN8sR+hJTu/DSRwcymsFy64zym0sRmbMSSnAyW2LTh8Hy93HTe9Dy69Mzw+My/zJTl+XzN6////9x9e+z2/JTC1Gy84NxkZN9NTLTq+0ygy+SqrLzE2iSKv0yq1ySZ03zW9NH7/KTZ7OOTlNyIh1y04HzE5DSd04zM6Lj5/My1xNz2/NxvbvTAvGzE7RyLxaTj9ZTS68Ts9cRZXJTe73Ta9MyKj9xXVSSf20Sdziyq5GzO8FzE7EOu4oTS6Uy05+x7e2y03IzD4fzY3MxydMygrMTg8Eyu4BSf4NP2/LTP6Dyn3fL+/Lny+SSQyP///+xwcdRYWAyS1GS96bfm9P///4TM7Oi4vKbe8eyHhWSz14TE4zai1cy6xPDMzKzk9pTY9Gyu1NympIy+3ITf+f///6TI5HS95FSo1XTD5iyx61S05Ozi7F2u1f///9RjZNSUnByY1IS93tTx+f///+xqbIzS8qTP5c+OlONeXOTe5Ly81OTCzOTS3OP9/OySj0zE8ESWvPzw7vSyrPzS2Pzk49R9gfSsqPzAwYzq9IzX9WzS/MTS5Oygn8T3/Pz+/BySzdyuvDeWydCuuORqaLzK5NyapMxeX9J2fEy+/M9SVGTS9MyChMlqbMyaoszG1N9ST+SurNyOjOR2dOzGxKzy/JTK5ESizn/S9+yChMTm/Pz2+fS6vBSOzGSp1NSnrv///1Sh0CyJuSyY0Kza7NS2xNSHjCyg2nTL8WTC6iyQxazJ5MTy+/ze3ux2dNReXOyOjNRqbPzq5PzGxNSanJze9FSu3NS6xCSo5pzX62TO9Mx9gZzq9ESn1MxlZBSa3ES77Jzl9kSy6OR7e+RjY7zr9+yopMTC1+SGhDydzuT2++RwbZzS6MxXV+RYVDSm4XS22dRub9Sgpxye3LzO5kSp3FS67JzX9ozg9DSy7Kzr+6zS5MS+0dRMTNTq9MyqvFy97MyUnLTi/Hy95Hzg9NTCzHzN9JTE5Gy+7CwAAAAAyADIAAAI/gAtCRxIsKDBgwgTKlzIsKHDhxAjSpxIsaLFixgzatzIsaPHjyBDihxJsqTJkyhTqlzJsqXLlzBjypxJs6bNmzhz6tzJs6fPnyOnVBR6UNYUWQOFIrV0lCBRhU8LGl3K1NLSqAafanU60GhSgU2rItwKlutMpQ2xSmVKlWBbhG8TIg271q1Aql7tasSLNe5FvxuXAu5atLDZuwzj+n371G/Ut4sdtn1ct3LDwRXnOiTaVjNDtVkLbvWcUC3oh1hPY1RtWDJIzF9FQ40deSHrw3DFcpZL+KHn3SoF57bbuHJtxMgTu+4d8fZBotBxS9/peLPE26Bhr3UO1DJHurIp/l5Nipk77bJgtUsUnL217+Q0KcMX+3ziYMDmQxscr7E9/ZR4KTcfbwNalZxwz1FF1nDaoRXbf7PZltyCY2GknkIXSviZdP41V5+AFOWHH0x5cZThUAZumCKBxD24In2wKQZhTfktR9KJ3bGE43szdsRfgXuRaGJ4eu3oFnZ6EclbjR9OVCOTQHW2XYXMsehiaVbahx6WFhm50IVeKsnlfI1l19dmI4KYGGjchQlkZvoV552P16W1H2JsqlglcqRZ6FGY8uU4nZ0e1hSXWpilaV2PMTWY0WQfucloRInelqhkFHp46Wov+imeSHypuSWmdS5q6qiewnkZi20OSuaV/lmx5+Snheak4HrDoarlnhCdueqcutGa5EuSRjjkmMM2d2iuUP4o6LN3dvrnm4GhpN6FrBX7V5PV6hofpdB2u1KMwPLI66+5UpksteqG+9EGJeAh77z0qkMvHvbeq68JW6g2hQyVJCAKKPAUHEQcBiNc8MJBLKwwPA0X/HDEEC9MRAuFQCkuTksV4koWIIcMQcggjyxyFiOnXDLItERQGhVoKEACLSADULPNIdsMAM5Z6Nxzzj4H/TMAtLhCha+4SuseTxtQwzPJUEctdci09PvcOzPvPPXWT9f889ZeA4BHCxpDK2W0BBXSQNdgtw2yDVs8ZwYJXLuds91SA0DN/jCqaXefufW5ee1YH7fNdttWO1UIEDRHfTjehkdtQhIZQ8RfVGUv/STgBxUyBs6PQ85y3JPFY4PPeUONuuhg01ICChpnKHiv1Jo3V+Gst544WFMUcXruwH8ttS84WDopirGC5G9ChUgRevBxi1bD8yRTH/nUOtMBO3OQEdh9eusqvSusD3lM/eNPWAPyEyZXnRUD1jtevdd3sz5GCqmRj92teuLmN9oU2YAUcgcBa6iPfizjRmrgl7rgOZAWSNie5dgFnxphCzIWlE0hnAa5Ah5waniInlMYOD/VOZB1DTBD5h7VkRWKZgyNg5rJUFayJ1DPfaIhYdRmyMOTAaCH/isLIg2FaDIAXMINhZDRtM6lLRshxGNSg8ATaii6qj1mCjokmRSpmAUDgswaJmPf+sIYsimOcX1cBBk1FHgjUGFIfArZ4OHiJ7UQOogpWqDjCUVnAjFUjoLoMtRDNrC2PULtEiIESyHyaMhG5qwER4NjeQCpn07tyIWI2aAjQ4bI1DByk4YEwA9eMAURTfBLAOQcsuQEljEEDwImg2XI7JhDnvEMiKB8Hi2aUYHlhYh2gTFlQeTIOliC8YszRCRxGBBFM24RbLI8GTRjOTUXjMOFg6OkEysJSChGMWTq+2HKPhg1Wo5Qj9GM5jPUQTIxdlGaWXCmGaVJizBAwTRL/muXSYBzkSm4UmrOPGAB3abMyTCzgwI94DWCcAmAltFtAwXZGJhRSgaJ6Vl+MR8oO1nLPR7gFz9g3Q3dIANEcSs8kuoTKtNFwSkMsH4nDOH79ggAYEzDCAjU49SoEYE7qrKfteqP51a3R34tUHg7JKfjalABDJggeEoNmQ0kUNJfWjVLqjzbjJqmU7fJtKNRS2jJogoAOECBG9SI4UOnVkBYzhBqRNhdIJPGwsNkip9O+ScBYzlDo4rmk1qMpshmyDM4VKAQLXgq1Mg5zykKFmXkvEQRCqEhcCEHkxZxzhQKKUOxQlZkBzwmyPg107q1jRY10MMU0Pq8Dz4WniCj/kMOMIsguo6vIt7cYcn46jYTsPGcBPxgaqdQiBo0lGpEoxktupoFXeCAstoM3zYJta0VqQ2UWfCrUwAbubYWEQ56YEoEgGADEgCBDudoQRLU4IYwuCJrkAMAC/hGLiiZVFWW5B6fxgJDUJK2LYt83A/F+ljUhpe4HMjDOKIwgnnE4MEx8EYUUiABavzObr7AX0YwC0xvQYSYohOtaEOm3btMQQtsdexup1aDqsoiEM7QBBPu8Ide9KIRvegBPhYQg3X4g3F2o0UHeslSV6kkf+R7jl7tZsB0vjW7v+UdI9n25KnRwg3hkEUiVpGGVDRCA6pQBZhnII4ZmLkRd4hB/hTcYAMZzjNkLthFRU8pJIxoFKIqBluJwcJdpLoNABIIBzFQkQoNfOMI2vhGMY4QZlWI4wriQAY6pFEKU/gjGLc0IS3MKt3jXQlS8LlgddNGjWZyscpS8y1WCtEB5pJMF20gRCcMrQ1Y2BoMsNDGEXYtjl5vwgMeQEYPLDAOXVCvAT01VqpOettV+dOEQ4w22MRI2r+6GmQkEIMplrGCWn8DDOCGBa5hoQpdO1oc29iGB+wwCjL4owphnSEtuiCDq/amifo8FamvPTVV5/CBHZhEGjSQaHGD++Dh1rU2IH2FdK9bGqYQg1pR9tYS9AvJ1anu5oCVoWefMH0kM0EO/hB0YlNDO2TUiIImGvGNb9z6GCqA+TEO/o1y+zrd2wBENf7ACVxM/JCTjW6H8Wtbg2jS1SCHmr+3e7hYmtEa87xEEvhRaF2DG+YqoAQlVGAIDRzD1sVQBaQ3sYlt+MAHpLCFH0iAapbJYbb6bomzOk2foebOi1L7QSL5zNxdciINn6j11VXQDRoYvhsq4Dquy+1onAOiHHaQhjdY8LxLUJQ13OlQZs+VIvwcqtQhznPUfLH3UvY5yGIgQw90bfCse2ERxCCGMrphiK/n+giPRnfOy4GFaizgBW3u4ptrFoYKDMunne7bfjLHmFR2rL9uPvXwpaaLKIMFGMzVBQcw/tGIcn8bDFmnATFkwYjZq+DgjH90usvhg3KQowdRUMDzgvEF6G64yHCsUnRWw8FN6t3oHQA8TsAJs6YKuwZuXEcDShB75pdw2iB2ZZduZ3cKnyAIdPBzJEMLwAAFF9VCHsZN+cYQnoNdvtAEWYF9O/R0KtgzLCAIKyAO3jd4jkADj6AMihBzCYd7vbZ+5VAOoUAKApAHGPhqctU/QkcSrDRM/edIPxBlQnFiXXVlFgBmqrBoBwdzWkcJhlB74KYBiAZpjsd+H6ADTOAPQ0g1LVBVKtJ8SUIXzHck3uMtm8Vvw7N3eGRLQSYBZPAJMFhusKABg3cMtTdzYKANYBBm/jf3eOXwAaFADqXQBsEHNUmXBeBwcbMiKLnlZ8DjCzmQFad3ciwjBs7wCWRWDNpgiAgHBoQIBl6oDcXwaJsACDkHCD5wCh9ADvgAiW5DC0VQb2+0EpiTT2nxT13TdmV0QO6UBb7wW3MxBShYRXr4CZsQdqaoCreGcICIaLh3BWRXdo9ni2OYDm1whjlDDXAXG8ZDXaOWZDPSMUsoMvKURlvjC7HgiVHYAYKgATNAdlX4gLZGbramcA/oa97Yg6dgiw6wAGpAM6ATNlQzAEl0b5yCLNGiRLWiNnT0Vo+zjKnxjFvTQwDQDCOwAsgwA5DWaA+YaOWGaFWYe+kGCIr4/gEy6QACcA7kmDOyxWGexhaXuHwDkhqc5UgcKRoeCY/S1zPgIAydUA1kJw6bUIWNVm5h52hjF4GKCI4EgAAjgAtUJjWXUH+o0Sc66SL5kYQDcWeiY4zLeILMJXWYgA4esA1NeZJi52iveHM5t3s+IJMfQAD44AeYFjXJmDPtEF5GOBKDsUKElJZdhIxPxomYU1zW0zW0gAbz0APIAAjduAncCGm5B4aO93h7KZP0UA32wGYIBDZwM2dEAiapFCQSUQjsED/GFFVQw4lZMT0l1JBSkwltYAtwKYtyuZlkJ5c4N4vlcJB8SQA9wAng0FUdoIZ0EhSv6Y5sdTIRBTYA/gCZ1gY8tEAH3tALduABsiic6VZ2sfiSiriIy+kAZKAPF/ZN0QYAwcANG0B0D3Jfm6dsSdEAJvdMeEOPmINFDmQCHBADSwCT5jmLswiTPViLfNmXOlAKfiB/13lMyYhavriTupKOcceTFKFRdDhDeKBC0LEBKEAETSdNjwUAriAP9rAEWOADCvp4CtqDD8qepEkAD7AOITCEI0Z9fMOfyPMRmhWU2DNNyQgM3FBSxJUDRYCBz/RMeFBguMAJwGkM7dd+OJqjHwCOpKkD+MAJtRCJucOL9veBSMh5loFXAgFiexWkWWADcoABODAOGEAHNmCMeEMLajAHqPAJ5DCj/smZnHtpi2BKDwTgAKVApmaaOwAQAkP6IoBxH2/YKW4qjEyBpHhjTG2XXLRwk3ZjM1cmA4kwCKmADlhAD6NJD6dAD6TZl+QwCprQBm8gqm5jAxBZpEaKVXHkn2nZVhCFXR2gWuTnBYXmCTpADgQQCs1KADqADL1gCyOgBuBAjq+FPdQgnaixUh4YmyVwnRS3W3LqQB9km6rzD4ZpFYxQBqiwDKnQCxqwAr2QCrawCsRQD7hwOq2FrlFDCzdwn+yopkSKLJ5hkWPRDP/pWUPzcTYTURCABz3Tom6gWuiRCImQDMQAe4yQCEtRD9cqYHcjsjVTC3/0IUySKd9RJEmB/kV0iF3pRE4a+iH8UwhwsFzB+kVSUwXTUDYn4igfqhYb0AVD2DW8CVUO1AXh4EtJsQEgkAkN1FkiVmW0wABpOl0cai4Ii7Km87I9M7WC+U7eOQApKwNw8KhRJKxSQ05Lhx47chzAZDvPgQK5YEhg5FpkpLPQdEBsg2z2ZQbw5mcQi64PK28SwJqaujw/u5+iMQWttkOEtba8tbbT9rBgxEPhlAWoxYETAQXwQ2V8yjXBUAmtoqndujT/4xTcEJha5Fqela2sc64yNEMl0FOBghmF8AVoS1NFgLjgM7B0tzFKU0q/EJ+Qu2LY1Ta+8AIn2xwVoLDaGW9g4wISdLp1/sUobKimU1ABSICrJ+RquvAC9xQgHwYNgTtWSTquW0ML14R8OsJhQpEDNYCzySuJfdoAA8Cth7m9szlYuTN8IVC9OQIbhQAFA1ACl+C9ABVGeStEZmS0wVADZqC/HSYDvsNWMzSYY/RklsckFsk/BSsrwDsWhZADA6AFY3AJlEk17VNEmrsz1rBcP4SzREM0NUMLI0MzlzAGNXADqoVNYMENIXA6oWrDmmsNRlzEoUo1ShyqJFAAY5k0UXwkBcwNW3ADA/ACfbDFXNzFXtzFL9AFfaDFWtwFONAHYlwEYLzF0GAG3AAFGzBn5GIbG5ADu3ADzHADeqzHX/AFefwF/tgAyHr8x33MDH8cyF/QBMEYgiOMmGlRShtQCOEQDpE8yZI8yeFQCBuAyZgsyZ6cyZUsyZucyaQcyfsHIirLO6UEyVMQx6wcx668yhkjy6xMW11Rlsz2PZIUIYu8f/hUFr/hmrlcGhX1hExhzF+xyKYCt0VXJRY5xe4SzabLE/iGb8+izHsht6UivOWybNnCbP+xLLApJuDxiz0JSGXSIgSbyts8wj6VTfj3FalrWd+atQaCeUYmEpiFy/kMzej8miAYJb5KsBvhz/PxI5rXLtbsFKAWaq4CwgTdJIvbeUuSf0jyK7CBZOPSzqJizvbGz8G7bPbMpkpyyvYGzpal/tEFi5/dzKvUWWcfGrc8adLGHB3IzBU1zSg5jcynsRU3HSdVsdO6UVsTEtRGzdOVVCIVItQ5jVvhIAPhAAUyMNVUPdX3iRSjXNVSXdVL27STDAVRHdZgHQ5ZMclVzdWY89UyANZbPdWTzCaXfNZyvdZhfbUta9Zz7dacrMmrDLylhNd5rdUy0LyfEQF54AZw4AYS4AaIzdhwIAF+sLRT0AQvAAfn8NiIfdmaHWhXEQV50AFw8NihfQ4SIAHjEJFEIQPjsNiZPdqPXQ9JYQB5AActwNiaTduP3QqwvSXh4AcSkNiM3dqtfdsS0Aa+yxSy7QaXHdyJLdot0AIYIAZm/jwAu7AF3FABgy2wCbEBEcDajr3czL3cj80BJYUtxWsDoZre6k0LBQDbUzAOmYDeTazeJEBkTFGm6S3foWoDrpBsYBELBWAD+q3eNuDfUwCYy7XeRWwDiKBCorEFJSDgCj7h+40IhE1c0JALA67gmjvhNuACWjAAOUBZbGK2Ek7h6y3guWC7mxEN9Cs1uzQMTIEDJqA1VtaJTFEIF7i+NWB/U7AFTvDiGejgTAENKqxFNwMAYxAPqZECvqBTAEACkYQehbADJHA+2EMLNgAEKUDBAlEB7CDkdQMAunq1/hINNn44vDTjirW+OE5cYaBWXdMAu8MNTsA2OmPgRq6d/mNA5EnxAjUetVFjAxeAuLJQ5cYLqbRQBUHXGz/+5KxDC0KwoQyxAS6unbxUSjigC6f15oUQBqEDAFUgAZWzWndeQppL5FOw51yz5MWBWAqcM0KgFlV+5aFEAiaazBGwu4bjBL1Evs+B5s+T6VOAAz+gSzhuCZ9OjgBQAiDwhFtABENIC6pu5M8zBnI1BVAQgJDKDmaO6M8TsRKrS2/QvIcepZBafagh7GBD7DTe6We542CDB34kEEC+vtV+XKnT55gD4bHOSfpbCAOQ6FCjDtcADHLgC9op5VghA27w7yzj5wth6QyZmiAjBz/cCiHVOp4e54ZTAnwzBSBw6jBu/jWlZO2tLvFTsAvP6Z2TepZW3jYpVAgygAHHfnI2sAOYUwFv4EBFoN22celcs+bF3uZWJuM5TgfWE74ZY+c2DjXUThQbwOpbw+9JUQitcL6SuzWtwJrEtQMETzI8VUqsAKxWhgGYww2IEDp496/Ric0EYelPLzUYr+lGD+NEBueiGuM/TvL/mu98zuRdgVi8jjIUwE5TgwSIK/Bhj3K2SwVhLmA1oBVTcAO2PjVB8AwWnwUhMFuaJfTYQ+wan7YsY3xvKu9tYwKTNfKPE/VgMQ76njdj8OxJ4bln+AzRsPFSEwLSSVzMcPmBpUa2Wwmghz2/wJoy8A6FjweHkA1t/hcMRTgW7L41ctBLRb/1mov0eh9k8wUC2XC0Ef+EUzAAR171gh/EQT4/suQEa6D7UZMLMBAVtf40ngoy7LAFGUMFabW+axAVUAAHAAEAQBaCBQmO4XHN4EIbzApZghhRYsQp0WgNNAgBQsFmFaZMwWFi4UgbHiEWokNrJEGMBXUNwEak5cgtUyx9HHdpZUEAY0DYhDhl15iVGrPUiNdgodEsNm4AvVlogI2ZEKzxpGamUCFsY6puJGgDG1RLFZyMZEoEG7CZBmn9kiFR1sSIG6IJXMpUjp6PIXcWpFUhaKEwKv+6lbMm219aNYPmPNzzJ0VoOtFmAVAEhVKDTwBj/vgYsdAOEm0XNtiRw8w9PAs9FyRRCeqUCrrQXs3CYhgcwwWZtuNraS5digd67+zYV+ThwDanoDyO+a+vA/BMs3Tc17JrlmPiQd2AIbrBS18KNQO70slD0TuoHsZDxAgRPNcLoik0e8v2kbTgFCrikvSysGYjAHzJgTi67LKvIBb4mqKVHw7LIjDRCstrI6YIuuSZZ+yjxQznQLrENNyy8AkqPToYr6AftiikBv4W0oW9qNxrkCfpdrrECcfqGuCinfDoQipf7LuEG7IUnMK4HJOboo/l/rpEsKjoGKglpjYkiMuFAPiRxMhSDCqHZv4CgIgcCumiNR6HgUqq93Q0/qhBa4K4ZohWlARqrkJaaJEgXwaY4guidrJhgHAUlMguw+zbSzkTwYLAyudSojBTt8LEoYoxv4NogwgaaAsjABjw6IwfkCTUJlnk1HJACiGgIJobtiJrCj2wXGmgBkQEIRv7AHAjLkaDOgCvv1jwKMIJ0QLLwqhqCVTTjCBobEQcZhxpjOwKgSaYlgYy6i0opojHBWUXouWc0J6bKlbfwLIPD1+IkICKXHNAJMuRAHBC32HkELKgAjF7w6RjpxhiPKscFAwkE3LEQ2GU7PPysAJDFE47f0sl05JCxLAB2gqLyI8KcAKFABcUgCrknZJ30kgdeK4Zo0WBLnlDSYri/pl5JVoYOBcFDK8lSIEcQmN0A+OKYonZj16Y8i9LL6Y5jmesJYiWCIAS8zAyp4CCRftIMG8KFEJoUIGXo4pX7EhAMKOdE0kqID+4g87IGlo6yK8QOOYkaawlJ6qoYOQg9Is5K0XmdSVrjEiW62yD6hQtzwYaOwcjjptJl1sLQeGN6F7LwoSxTpqqKNzYqWmKHXw5jARQX/2F8HkvaQGFrVrwdCdaMHhoOOISz3Gvm6SkUNpLq3rtEmDecXOkg90S8aawl+pusikiIMq+MSCBoXw5qu8yWtD2LgosamBEt4FqbXjFOSiaaVAdDMqHQQh10GSAsRiFvMNILUoTG8kT/sBSMdFEzjccckM8rtGbh2XBS14D27YoNLYUBK8o9mqAKxqAB1kZBA9yCA2s0ESNr02BCiVY15eKAJQKqGspJzJBA3T4A24ZxAXBGSAPFNcl1EUqQlV7IIeu5sCFXEIClSiCBzNmkDDlpEGScU4R+Nari1SrIOBgjwp9c7cStHAY1DiOAnnyC+fkYItdYpemaEGFY93kBDOrStT0sDwkjsQEFmOiCSWAAjN5UY1eo4gGF/K/gpBJBrxZiRr/dRgTwElkcZsXT8r4kUpQI48GqcFHNnAD0KEpgQOiBTM2sLA1DHEkRqQahf44mEAWxImkK4IXAZOdDbSOe10Dx0+m/mAAFmCMayzBQwo+IgNM7uR9H3nhG3kSyilsoAu6PEwJ8yDA40GCcBBAHWag1KYNAnImqLulUDjTvOzdRJF/SdEUtuCKY/4lAF2TwEOk4sqFbHIKZ7ziL/KDglrWcyFveBuTpqG7kRihWS1A30rYAQVafjILl/iP2mrwxifcDYOYm9FMsFiIFIiLQgCghQ34ec+C4OENgYubffz5QpVcBwBw+Ige+sUSxqiUnwtRAB2PBYJc5GgMDqmEFgKlRi0Y63k8ksBHSHqk5nGqRGL7CYAYmgVJ+oIHF7gANk4Q0fQMBBGyidlWDfLMKVQiBF4UqAtLsxTUWWMIYb1AEeBB/iEbTONwEoECpg7ji3YQoYddAoDtNgAzXpkmnbQJQ6Y+KjINDiuYZBOCNA3iBBBspRBUoN1hfvAdGWgRegbxJ0APw0aubDU9g/Id6RgQyWhN4K8U4YYucmStv51rMG+oVz6dE5IcXc6d42HpQX7CDQb8lCVaaJbIXLCTLF0CZaNRa0H82ckhBoBeoZTBL3TZgBbehEWd2RAADjEF49Glml8oKl2/xBg6KOxKwX0XN5yw269p751Ca8BPzEAq5sBBBjBzRSlNyIKtNPNfM0XjYf5TCDns1gmxABscDluQZ6xyYS4kwhBLyCM4+FY4JylAoNJ5EjFsuEJbSGQV/PWv/svuAoFoKhJEZDEFJ1jGPq5ocHYJ8obYVSLBwwINFGyIJjqYeApiiOh8PfxhKECjAMGgxYhXUgU6RCA/7KVIIahlGlqYIA9M+57p/mKDMLVCxiIFTAioAK6SNcgGygzKFDrgYlqAowIoGAAJnEuLN0TgJsN4g2YBYIP/QEHQMXQL4IYzBWhQ1YIVwkxNATDlAQYFBVR4hRxccAk80MJvrSk1HnRhBAxw48vH4wAdmiGHZrTDCLRuxzn8MJtCjIMOcjDCreXQjlnLIQz1oEgTwsACOTTbCCwI9q/DIIEKFEIeYWiGE2gt7GA3OwyGpogfsI1rI9i61kagwzkMsIEt/tSiGd0Odrnl4AQWcKAeH4FCrGcd7XZomw5hUKYBsC3sYZdb2CzYNUW2cI5f7/vcta41p+v4EakWohLxwMYOIvGKSFzADHOmONPcK9XnlDxwItdeyEu+cpFX8+QvX/lgSM5yvSHO5Dc/ucpvvnOwzRzmegt54BZbiMXGnCI+x/ltidPeOt7E6U2HekQm/fSnKz3qVKfI1bW+da4HpelW/zrXmd51qZPd7GdHO9jRPvGuj13tEvnr2NdO9rm8Hetbv23e5753vp/Y7nA/cd8Fz/ao/x3qrhr80t27eK8zqr23lbtc5m54wq898k0fjvGsfnmuUz7xCuI857Mu9rtf/t14op864x1f9gGKHu8Lq6PrAw/1zJd+InLHveSvjnjAV/5wfXp945fk+diPnvXHurzViW982DM/8ctv/OdvP/ndg57vxIc+3aU//c73vtOyV33UmQ59uWcf7bnvutLRf/YdI1/3mH+/+6/f/ccj7vjcp33+FR/27vcd/MH3vv2ji/87O/OrPsGTPQM8wMObvb2LvPZ6wPRbPQHsu9loPgaUPgXUsQskO7DZvuj7wAAcQNODPxDUPw4kQBFkkq1LQRUUwRZEwKcjwLeDQfs7nvDDwQUsvBCMvuHjv70jP8rTQLtLwMDLlRu8PbXTQOsbwSVEQrtbkstzO7frNAeU/j7UY0Em1EEt5EEunMDTe8H7K0EwnEC/S7sdtLwSRMMRbEI2LD7q60KzK0Ib5MEatL0ulL32c0EkpEIJXD/5w0AYTD4kvEOt+ysnpEMzLEQ4BD21S0EpjMMDrL8LhDw39D9LjEQ2RMQzZD9CvMRMBEUSxMAs3MBSzMTNC8UB3MQ0vDulA74GVL4GjL+7i0D3Gr8qNMXG+8M1dMVEZDpIbETxi79VdD5AZJL1o8FYLDsarDwK5MBODEUntENSLEZPLEP880Gtm8YtLEUFPJxtRMHtqz021LxEDIpa9EJM1Mb9g8AVBEFg/EFjxD8xBMTfi0dZvMZqxLojLD0wa8ZnWfzGH/S8bPzHtkvFg+xAhDTBOCRGhaRH0nu+SZzFDDS+cgRFGFTGeTS+vztEfITFubNIRUy8uru/XVw7qEDGrPtFfcxFa3xDCRRFd3TImaTJmrTJm8TJgwwIADs=";

// ── Heroicons (inline SVG) ────────────────────────────────────────────────────
const Icon = {
  Map: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"/></svg>,
  ChartBar: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/></svg>,
  Briefcase: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z"/></svg>,
  Brain: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"/></svg>,
  Users: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg>,
  Academic: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"/></svg>,
  Bell: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/></svg>,
  Arrow: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" width="14" height="14"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>,
  Check: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" width="10" height="10"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>,
  Lock: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" width="11" height="11"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/></svg>,
  Link: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" width="14" height="14"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"/></svg>,
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" width="14" height="14"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>,
  X: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>,
  Warning: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/></svg>,
  Logout: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" width="16" height="16"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"/></svg>,
  ChevDown: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="14" height="14"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/></svg>,
};

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  primary:   "#6366f1",
  primaryDark:"#4f46e5",
  violet:    "#8b5cf6",
  cyan:      "#06b6d4",
  green:     "#10b981",
  amber:     "#f59e0b",
  red:       "#ef4444",
  orange:    "#f97316",
  bg:        "#f1f5f9",
  surface:   "#ffffff",
  border:    "#e2e8f0",
  text:      "#0f172a",
  muted:     "#64748b",
  subtle:    "#94a3b8",
  grad1:     "linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)",
  grad2:     "linear-gradient(135deg,#06b6d4 0%,#6366f1 100%)",
  grad3:     "linear-gradient(135deg,#10b981 0%,#06b6d4 100%)",
  shadow:    "0 1px 3px rgba(0,0,0,0.06),0 4px 16px rgba(0,0,0,0.04)",
  shadowMd:  "0 4px 24px rgba(99,102,241,0.12)",
};

const areaColors = { "Formação Básica":"#64748b","Finanças e Contabilidade":"#1d4ed8","Marketing":"#7c3aed","Gestão de Pessoas":"#047857","Estratégia":"#b45309","Operações":"#dc2626","Economia":"#0891b2","Empreendedorismo":"#d97706","Tecnologia e Inovação":"#6d28d9","Direito e Legislação":"#374151","Integração":"#9333ea","Especialização":"#0891b2","Prática":"#dc2626" };
const EXP_TYPES = ["Estágio","Emprego","Projeto Acadêmico","Voluntariado","Pesquisa","Extensão","Intercâmbio","Outro"];

// ── Helpers ──────────────────────────────────────────────────────────────────
function getAutoCompetencies(completedSet, disciplines = []) {
  const map = {};
  disciplines.forEach(d => {
    if (completedSet.has(d.id)) {
      (d.competencies || []).forEach(c => { map[c] = (map[c] || 0) + 1; });
    }
  });
  return Object.entries(map).sort((a,b) => b[1]-a[1]).map(([name, count]) => ({ name, count, source:"auto" }));
}

// ── Login Screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin, loading }) {
  return (
    <div style={{ minHeight:"100vh",background:"#f8f9fb",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans','Helvetica Neue',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Serif+Display&display=swap');`}</style>
      <div style={{ background:"#fff",borderRadius:16,border:"1px solid #e5e7eb",padding:"48px 40px",width:380,textAlign:"center",boxShadow:"0 4px 24px rgba(0,0,0,0.06)" }}>
        <img src={LOGO_B64} alt="UNIARA" style={{ height:56,objectFit:"contain",marginBottom:24 }} />
        <h1 style={{ fontFamily:"'DM Serif Display',serif",fontSize:22,fontWeight:400,color:"#1a1a2e",marginBottom:8 }}>Mapa de Aprendizagem</h1>
        <p style={{ fontSize:13,color:"#6b7280",marginBottom:32 }}>Ecossistema · UNIARA</p>
        <button onClick={onLogin} disabled={loading} style={{ width:"100%",padding:"12px 0",borderRadius:9,border:"1px solid #e5e7eb",background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",gap:10,fontSize:14,fontWeight:600,color:"#374151",cursor:loading?"wait":"pointer" }}>
          <svg width="18" height="18" viewBox="0 0 18 18"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/><path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg>
          {loading ? "Entrando..." : "Entrar com Google"}
        </button>
        <p style={{ fontSize:11,color:"#9ca3af",marginTop:20 }}>Seu progresso ficará salvo automaticamente</p>
      </div>
    </div>
  );
}

// ── Radar Chart ──────────────────────────────────────────────────────────────
function RadarChart({ data, color, size=180 }) {
  const cx=size/2,cy=size/2,r=size*0.36,n=data.length;
  const angle=i=>(Math.PI*2*i)/n-Math.PI/2;
  const pt=(i,radius)=>[cx+radius*Math.cos(angle(i)),cy+radius*Math.sin(angle(i))];
  return (
    <svg width={size} height={size} style={{ overflow:"visible" }}>
      {[0.25,0.5,0.75,1].map(g=><polygon key={g} points={data.map((_,i)=>pt(i,r*g).join(",")).join(" ")} fill="none" stroke="#e5e7eb" strokeWidth="1"/>)}
      {data.map((_,i)=><line key={i} x1={cx} y1={cy} x2={pt(i,r)[0]} y2={pt(i,r)[1]} stroke="#e5e7eb" strokeWidth="1"/>)}
      <polygon points={data.map((d,i)=>pt(i,r*(d.value/5)).join(",")).join(" ")} fill={color+"28"} stroke={color} strokeWidth="2"/>
      {data.map((d,i)=>{ const [lx,ly]=pt(i,r*1.32),[dx,dy]=pt(i,r*(d.value/5)); return <g key={i}><circle cx={dx} cy={dy} r="3.5" fill={color}/><text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" style={{ fontSize:9,fill:"#6b7280",fontFamily:"'DM Sans',sans-serif",fontWeight:500 }}>{d.name}</text></g>;})}
    </svg>
  );
}

// ── Portfolio View ───────────────────────────────────────────────────────────
function PortfolioView({ user, completed, experiences, onAddExperience, onDeleteExperience, onShareLink, disciplines = [], careers = [] }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type:"Estágio",title:"",organization:"",startDate:"",endDate:"",current:false,description:"" });
  const autoComps = getAutoCompetencies(completed, disciplines);
  const totalComps = autoComps.length;
  const totalDiscs = completed.size;

  const handleSubmit = async () => {
    if (!form.title || !form.organization) return;
    await onAddExperience(form);
    setForm({ type:"Estágio",title:"",organization:"",startDate:"",endDate:"",current:false,description:"" });
    setShowForm(false);
  };

  return (
    <div className="fade-in" style={{ padding:"24px 28px",overflowY:"auto",height:"100%" }}>
      <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:22 }}>
        <div>
          <h1 style={{ fontFamily:"'DM Serif Display',serif",fontSize:24,fontWeight:400,color:"#1a1a2e" }}>Banco de Competências</h1>
          <p style={{ fontSize:13,color:"#6b7280",marginTop:3 }}>Seu portfólio acadêmico e profissional</p>
        </div>
        <div style={{ display:"flex",gap:8 }}>
          <button onClick={onShareLink} style={{ padding:"8px 14px",borderRadius:8,border:"1px solid #e5e7eb",background:"#fff",fontSize:12,fontWeight:600,color:"#374151",cursor:"pointer",display:"flex",alignItems:"center",gap:6 }}>🔗 Copiar link</button>
          <button onClick={()=>window.print()} style={{ padding:"8px 14px",borderRadius:8,border:"1px solid #1d4ed8",background:"#1d4ed8",fontSize:12,fontWeight:600,color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",gap:6 }}>📄 Exportar PDF</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20 }}>
        {[
          ["🎓","Disciplinas","Concluídas",totalDiscs,disciplines.length,"#1d4ed8"],
          ["🧠","Competências","Adquiridas",totalComps,"—","#7c3aed"],
          ["💼","Experiências","Registradas",experiences.length,"—","#047857"],
          ["📊","Progresso","Geral",disciplines.length ? Math.round((completed.size/disciplines.length)*100)+"%" : "0%","—","#b45309"],
        ].map(([icon,l1,l2,v,total,color])=>(
          <div key={l1} style={{ background:"#fff",borderRadius:12,border:"1px solid #e5e7eb",padding:"14px 16px" }}>
            <div style={{ fontSize:20,marginBottom:6 }}>{icon}</div>
            <div style={{ fontSize:22,fontWeight:700,color }}>{v}{total!=="—"&&<span style={{ fontSize:11,color:"#9ca3af",fontWeight:400 }}>/{total}</span>}</div>
            <div style={{ fontSize:11,color:"#6b7280" }}>{l1} {l2}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"1.2fr 1fr",gap:14 }}>
        {/* Competências automáticas */}
        <div style={{ background:"#fff",borderRadius:12,border:"1px solid #e5e7eb",padding:18 }}>
          <div style={{ fontSize:12,fontWeight:700,color:"#1a1a2e",marginBottom:4 }}>🧠 Competências Adquiridas</div>
          <p style={{ fontSize:11,color:"#9ca3af",marginBottom:14 }}>Geradas automaticamente pelas disciplinas concluídas</p>
          {autoComps.length === 0 ? (
            <p style={{ fontSize:12,color:"#9ca3af",fontStyle:"italic" }}>Conclua disciplinas para gerar competências automaticamente.</p>
          ) : (
            <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
              {autoComps.map(c=>(
                <div key={c.name} style={{ display:"flex",alignItems:"center",gap:5,padding:"4px 10px",background:"#eff6ff",borderRadius:6,border:"1px solid #bfdbfe" }}>
                  <span style={{ fontSize:11,fontWeight:600,color:"#1d4ed8" }}>{c.name}</span>
                  <span style={{ fontSize:9,background:"#1d4ed8",color:"#fff",borderRadius:8,padding:"0 5px",fontWeight:700 }}>{c.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Experiências */}
        <div style={{ background:"#fff",borderRadius:12,border:"1px solid #e5e7eb",padding:18 }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4 }}>
            <div style={{ fontSize:12,fontWeight:700,color:"#1a1a2e" }}>💼 Experiências</div>
            <button onClick={()=>setShowForm(!showForm)} style={{ padding:"4px 10px",borderRadius:6,border:"none",background:"#1d4ed8",color:"#fff",fontSize:11,fontWeight:600,cursor:"pointer" }}>+ Adicionar</button>
          </div>
          <p style={{ fontSize:11,color:"#9ca3af",marginBottom:14 }}>Estágios, projetos, voluntariado e mais</p>

          {showForm && (
            <div style={{ background:"#f9fafb",borderRadius:10,padding:14,marginBottom:14,border:"1px solid #e5e7eb" }}>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8 }}>
                <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} style={{ padding:"6px 8px",borderRadius:6,border:"1px solid #d1d5db",fontSize:12,background:"#fff" }}>
                  {EXP_TYPES.map(t=><option key={t}>{t}</option>)}
                </select>
                <input placeholder="Título / Cargo" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} style={{ padding:"6px 8px",borderRadius:6,border:"1px solid #d1d5db",fontSize:12 }} />
                <input placeholder="Empresa / Instituição" value={form.organization} onChange={e=>setForm(f=>({...f,organization:e.target.value}))} style={{ padding:"6px 8px",borderRadius:6,border:"1px solid #d1d5db",fontSize:12 }} />
                <input type="month" placeholder="Início" value={form.startDate} onChange={e=>setForm(f=>({...f,startDate:e.target.value}))} style={{ padding:"6px 8px",borderRadius:6,border:"1px solid #d1d5db",fontSize:12 }} />
                {!form.current && <input type="month" placeholder="Fim" value={form.endDate} onChange={e=>setForm(f=>({...f,endDate:e.target.value}))} style={{ padding:"6px 8px",borderRadius:6,border:"1px solid #d1d5db",fontSize:12 }} />}
                <label style={{ display:"flex",alignItems:"center",gap:5,fontSize:11,color:"#374151" }}><input type="checkbox" checked={form.current} onChange={e=>setForm(f=>({...f,current:e.target.checked}))} /> Atual</label>
              </div>
              <textarea placeholder="Descrição (atividades, resultados, aprendizados...)" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={3} style={{ width:"100%",padding:"6px 8px",borderRadius:6,border:"1px solid #d1d5db",fontSize:12,resize:"vertical",fontFamily:"inherit" }} />
              <div style={{ display:"flex",gap:6,marginTop:8 }}>
                <button onClick={handleSubmit} style={{ flex:1,padding:"7px",borderRadius:6,border:"none",background:"#1d4ed8",color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer" }}>Salvar</button>
                <button onClick={()=>setShowForm(false)} style={{ padding:"7px 14px",borderRadius:6,border:"1px solid #e5e7eb",background:"#fff",fontSize:12,color:"#6b7280",cursor:"pointer" }}>Cancelar</button>
              </div>
            </div>
          )}

          {experiences.length === 0 ? (
            <p style={{ fontSize:12,color:"#9ca3af",fontStyle:"italic" }}>Nenhuma experiência adicionada ainda.</p>
          ) : (
            <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
              {experiences.map(exp=>(
                <div key={exp.id} style={{ padding:"10px 12px",borderRadius:8,border:"1px solid #e5e7eb",background:"#fafafa" }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
                    <div>
                      <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:2 }}>
                        <span style={{ fontSize:10,fontWeight:600,padding:"1px 7px",borderRadius:4,background:"#eff6ff",color:"#1d4ed8" }}>{exp.type}</span>
                        {exp.current && <span style={{ fontSize:9,fontWeight:600,padding:"1px 6px",borderRadius:4,background:"#dcfce7",color:"#047857" }}>ATUAL</span>}
                      </div>
                      <div style={{ fontSize:12,fontWeight:600,color:"#1a1a2e" }}>{exp.title}</div>
                      <div style={{ fontSize:11,color:"#6b7280" }}>{exp.organization}</div>
                      {(exp.startDate||exp.endDate) && <div style={{ fontSize:10,color:"#9ca3af",marginTop:2 }}>{exp.startDate||""}{exp.endDate&&!exp.current?" → "+exp.endDate:exp.current?" → Atual":""}</div>}
                      {exp.description && <div style={{ fontSize:11,color:"#374151",marginTop:4,lineHeight:1.5 }}>{exp.description}</div>}
                    </div>
                    <button onClick={()=>onDeleteExperience(exp.id)} style={{ background:"none",border:"none",color:"#d1d5db",cursor:"pointer",fontSize:14,lineHeight:1 }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Career coverage */}
      <div style={{ background:"#fff",borderRadius:12,border:"1px solid #e5e7eb",padding:18,marginTop:14 }}>
        <div style={{ fontSize:12,fontWeight:700,color:"#1a1a2e",marginBottom:14 }}>🎯 Cobertura por Trilha de Carreira</div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10 }}>
          {careers.map(c=>{ const pct=c.disciplines.length ? Math.round((c.disciplines.filter(id=>completed.has(id)).length/c.disciplines.length)*100) : 0; return (
            <div key={c.id} style={{ padding:"10px 12px",borderRadius:8,border:`1px solid ${c.color}22`,background:`${c.color}06` }}>
              <div style={{ display:"flex",alignItems:"center",gap:7,marginBottom:7 }}><span style={{ fontSize:15 }}>{c.icon}</span><span style={{ fontSize:12,fontWeight:600,color:"#1a1a2e" }}>{c.name}</span><span style={{ marginLeft:"auto",fontSize:12,fontWeight:700,color:c.color }}>{pct}%</span></div>
              <div style={{ height:5,background:"#e5e7eb",borderRadius:3,overflow:"hidden" }}><div style={{ width:`${pct}%`,height:"100%",background:c.color,borderRadius:3,transition:"width 0.5s" }}/></div>
            </div>
          );})}
        </div>
      </div>

      <style>{`@media print { button { display: none !important; } }`}</style>
    </div>
  );
}

// ── Health Score ─────────────────────────────────────────────────────────────
function calcHealthScore(s, avgProgress) {
  let score = 0;
  const factors = [];

  const expectedProgress = s.estimatedSemester ? Math.round((s.estimatedSemester / 8) * 100) : null;
  if (expectedProgress !== null) {
    const gap = expectedProgress - s.progress;
    if (gap > 40) { score += 40; factors.push({ label:"Muito atrasado no progresso", severity:"critical" }); }
    else if (gap > 25) { score += 28; factors.push({ label:"Progresso abaixo do esperado", severity:"high" }); }
    else if (gap > 10) { score += 15; factors.push({ label:"Leve atraso no progresso", severity:"medium" }); }
  }

  if (s.daysSinceActivity === null) {
    score += 20; factors.push({ label:"Sem histórico de atividade", severity:"medium" });
  } else if (s.daysSinceActivity > 60) {
    score += 35; factors.push({ label:`${s.daysSinceActivity} dias sem acessar`, severity:"critical" });
  } else if (s.daysSinceActivity > 30) {
    score += 22; factors.push({ label:`${s.daysSinceActivity} dias sem acessar`, severity:"high" });
  } else if (s.daysSinceActivity > 14) {
    score += 10; factors.push({ label:`${s.daysSinceActivity} dias sem acessar`, severity:"medium" });
  }

  if (s.experienceCount === 0 && s.progress > 30) {
    score += 25; factors.push({ label:"Nenhuma experiência registrada", severity:"high" });
  } else if (s.experienceCount === 0) {
    score += 10; factors.push({ label:"Nenhuma experiência ainda", severity:"medium" });
  }

  score = Math.min(100, score);

  let level, color, bg, label;
  if (score >= 75)      { level="crítico";  color="#dc2626"; bg="#fee2e2"; label="🔴 Crítico"; }
  else if (score >= 50) { level="alto";     color="#ea580c"; bg="#ffedd5"; label="🟠 Alto"; }
  else if (score >= 25) { level="médio";    color="#d97706"; bg="#fef3c7"; label="🟡 Médio"; }
  else                  { level="baixo";    color="#047857"; bg="#dcfce7"; label="🟢 Baixo"; }

  return { score, level, color, bg, label, factors };
}

// ── Coordinator Dashboard ────────────────────────────────────────────────────
function CoordDashboard({ allStudents }) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("risco");
  const [filterRisk, setFilterRisk] = useState("todos");
  const [expandedStudent, setExpandedStudent] = useState(null);

  const avgProgress = allStudents.length ? Math.round(allStudents.reduce((a,s)=>a+s.progress,0)/allStudents.length) : 0;
  const avgComps = allStudents.length ? Math.round(allStudents.reduce((a,s)=>a+(s.competencyCount||0),0)/allStudents.length) : 0;

  const studentsWithScore = allStudents.map(s => ({
    ...s,
    health: calcHealthScore(s, avgProgress)
  }));

  const riskCounts = {
    crítico: studentsWithScore.filter(s=>s.health.level==="crítico").length,
    alto:    studentsWithScore.filter(s=>s.health.level==="alto").length,
    médio:   studentsWithScore.filter(s=>s.health.level==="médio").length,
    baixo:   studentsWithScore.filter(s=>s.health.level==="baixo").length,
  };

  const filtered = studentsWithScore
    .filter(s => {
      const matchSearch = s.name?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase());
      const matchRisk = filterRisk === "todos" || s.health.level === filterRisk;
      return matchSearch && matchRisk;
    })
    .sort((a,b) => {
      if (sortBy === "risco")    return b.health.score - a.health.score;
      if (sortBy === "progress") return b.progress - a.progress;
      return a.name?.localeCompare(b.name);
    });

  return (
    <div className="fade-in" style={{ padding:"24px 28px", overflowY:"auto", height:"100%" }}>
      <div style={{ marginBottom:22 }}>
        <h1 style={{ fontFamily:"'DM Serif Display',serif", fontSize:24, fontWeight:400, color:"#1a1a2e" }}>Dashboard do Coordenador</h1>
        <p style={{ fontSize:13, color:"#6b7280", marginTop:3 }}>Acompanhamento individual e score de saúde acadêmica</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:16 }}>
        {[
          ["👨‍🎓","Alunos","Cadastrados", allStudents.length, "#1d4ed8"],
          ["📊","Progresso","Médio", avgProgress+"%", "#7c3aed"],
          ["🧠","Competências","Média por aluno", avgComps, "#047857"],
          ["⚠️","Em risco","Alto ou Crítico", riskCounts.crítico + riskCounts.alto, "#dc2626"],
        ].map(([icon,l1,l2,v,color])=>(
          <div key={l1} style={{ background:"#fff", borderRadius:12, border:"1px solid #e5e7eb", padding:"14px 16px" }}>
            <div style={{ fontSize:20, marginBottom:6 }}>{icon}</div>
            <div style={{ fontSize:26, fontWeight:700, color }}>{v}</div>
            <div style={{ fontSize:11, color:"#6b7280" }}>{l1} {l2}</div>
          </div>
        ))}
      </div>

      <div style={{ background:"#fff", borderRadius:12, border:"1px solid #e5e7eb", padding:18, marginBottom:14 }}>
        <div style={{ fontSize:12, fontWeight:700, color:"#1a1a2e", marginBottom:14 }}>🎯 Distribuição de Risco de Evasão</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
          {[
            ["🔴","Crítico","crítico", riskCounts.crítico,"#dc2626","#fee2e2"],
            ["🟠","Alto","alto",       riskCounts.alto,    "#ea580c","#ffedd5"],
            ["🟡","Médio","médio",     riskCounts.médio,   "#d97706","#fef3c7"],
            ["🟢","Baixo","baixo",     riskCounts.baixo,   "#047857","#dcfce7"],
          ].map(([icon,label,level,count,color,bg])=>(
            <div key={label} onClick={()=>setFilterRisk(filterRisk===level?"todos":level)} style={{ textAlign:"center", padding:"14px 8px", borderRadius:8, background:filterRisk===level?bg:"#f9fafb", border:`1.5px solid ${filterRisk===level?color:"#e5e7eb"}`, cursor:"pointer", transition:"all 0.15s" }}>
              <div style={{ fontSize:22 }}>{icon}</div>
              <div style={{ fontSize:26, fontWeight:700, color }}>{count}</div>
              <div style={{ fontSize:11, fontWeight:600, color }}>{label}</div>
              <div style={{ fontSize:9, color:"#9ca3af", marginTop:2 }}>clique para filtrar</div>
            </div>
          ))}
        </div>
        {allStudents.length > 0 && (
          <div style={{ display:"flex", height:8, borderRadius:4, overflow:"hidden", marginTop:14, gap:1 }}>
            {[["#dc2626",riskCounts.crítico],["#ea580c",riskCounts.alto],["#d97706",riskCounts.médio],["#047857",riskCounts.baixo]].map(([color,count],i)=>(
              count > 0 && <div key={i} style={{ flex:count, background:color, transition:"flex 0.5s" }}/>
            ))}
          </div>
        )}
      </div>

      <div style={{ background:"#fff", borderRadius:12, border:"1px solid #e5e7eb", padding:18 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#1a1a2e", flex:1 }}>
            👨‍🎓 Alunos
            {filterRisk !== "todos" && <span style={{ marginLeft:8, fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:6, background:"#eff6ff", color:"#1d4ed8" }}>Filtro: {filterRisk}</span>}
          </div>
          <input placeholder="Buscar por nome ou e-mail..." value={search} onChange={e=>setSearch(e.target.value)} style={{ padding:"6px 12px", borderRadius:7, border:"1px solid #e5e7eb", fontSize:12, width:220 }}/>
          <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{ padding:"6px 8px", borderRadius:7, border:"1px solid #e5e7eb", fontSize:12 }}>
            <option value="risco">Ordenar: Maior Risco</option>
            <option value="progress">Ordenar: Progresso</option>
            <option value="name">Ordenar: Nome</option>
          </select>
        </div>

        {allStudents.length === 0 ? (
          <p style={{ fontSize:13, color:"#9ca3af", fontStyle:"italic", textAlign:"center", padding:"20px 0" }}>Nenhum aluno cadastrado ainda.</p>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {filtered.map(s => {
              const h = s.health;
              const isExpanded = expandedStudent === s.uid;
              return (
                <div key={s.uid} style={{ borderRadius:9, border:`1.5px solid ${isExpanded ? h.color : "#e5e7eb"}`, overflow:"hidden", transition:"border 0.2s" }}>
                  <div onClick={()=>setExpandedStudent(isExpanded ? null : s.uid)} style={{ display:"grid", gridTemplateColumns:"32px 1fr 150px 65px 65px 65px 100px", gap:10, alignItems:"center", padding:"10px 14px", background:isExpanded ? h.bg : "#f9fafb", cursor:"pointer" }}>
                    {s.photoURL
                      ? <img src={s.photoURL} style={{ width:28, height:28, borderRadius:"50%", border:"1.5px solid #e5e7eb" }} alt=""/>
                      : <div style={{ width:28, height:28, borderRadius:"50%", background:"#e5e7eb", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:600, color:"#6b7280" }}>{s.name?.[0]||"?"}</div>
                    }
                    <div>
                      <div style={{ fontSize:12, fontWeight:600, color:"#1a1a2e" }}>{s.name||"Sem nome"}</div>
                      <div style={{ fontSize:10, color:"#9ca3af" }}>{s.email}</div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <div style={{ flex:1, height:5, background:"#e5e7eb", borderRadius:3, overflow:"hidden" }}>
                        <div style={{ width:`${s.progress}%`, height:"100%", background:s.progress>=70?"#047857":s.progress>=40?"#1d4ed8":"#f59e0b", borderRadius:3 }}/>
                      </div>
                      <span style={{ fontSize:11, fontWeight:700, color:"#374151", minWidth:28 }}>{s.progress}%</span>
                    </div>
                    <div style={{ textAlign:"center" }}><div style={{ fontSize:13, fontWeight:700, color:"#1d4ed8" }}>{s.completedCount}</div><div style={{ fontSize:9, color:"#9ca3af" }}>discs.</div></div>
                    <div style={{ textAlign:"center" }}><div style={{ fontSize:13, fontWeight:700, color:"#7c3aed" }}>{s.competencyCount||0}</div><div style={{ fontSize:9, color:"#9ca3af" }}>comps.</div></div>
                    <div style={{ textAlign:"center" }}><div style={{ fontSize:13, fontWeight:700, color:"#047857" }}>{s.experienceCount||0}</div><div style={{ fontSize:9, color:"#9ca3af" }}>exps.</div></div>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <div style={{ flex:1, height:6, background:"#e5e7eb", borderRadius:3, overflow:"hidden" }}>
                        <div style={{ width:`${h.score}%`, height:"100%", background:h.color, borderRadius:3, transition:"width 0.5s" }}/>
                      </div>
                      <span style={{ fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:5, background:h.bg, color:h.color, whiteSpace:"nowrap" }}>{h.label}</span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ padding:"12px 14px 14px", background:"#fff", borderTop:`1px solid ${h.color}30` }}>
                      <div style={{ fontSize:11, fontWeight:700, color:"#374151", marginBottom:8 }}>Fatores de risco identificados:</div>
                      {h.factors.length === 0 ? (
                        <div style={{ fontSize:12, color:"#047857" }}>✅ Nenhum fator de risco identificado. Aluno em boa trajetória!</div>
                      ) : (
                        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                          {h.factors.map((f,i) => (
                            <div key={i} style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 10px", borderRadius:6, background:f.severity==="critical"?"#fee2e2":f.severity==="high"?"#ffedd5":"#fef3c7", border:`1px solid ${f.severity==="critical"?"#fca5a5":f.severity==="high"?"#fdba74":"#fde68a"}` }}>
                              <span style={{ fontSize:11 }}>{f.severity==="critical"?"🔴":f.severity==="high"?"🟠":"🟡"}</span>
                              <span style={{ fontSize:11, fontWeight:500, color:"#374151" }}>{f.label}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div style={{ display:"flex", gap:8, marginTop:10 }}>
                        <div style={{ fontSize:11, color:"#9ca3af" }}>
                          {s.daysSinceActivity !== null ? `Última atividade: há ${s.daysSinceActivity} dia${s.daysSinceActivity!==1?"s":""}` : "Sem registro de atividade"}
                          {s.recentActivity > 0 && ` · ${s.recentActivity} disciplinas nos últimos 60 dias`}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Gap Analysis ─────────────────────────────────────────────────────────────
function GapAnalysis({ completed, isUnlocked, toggleCompleted, setSelectedDisc, disciplines = [], careers = [] }) {
  const [selected, setSelected] = useState(careers[0]?.id);
  const career = careers.find(c=>c.id===selected);
  
  if (!career) return <div style={{ padding:24 }}>Nenhuma trilha encontrada para este curso.</div>;

  const careerDiscs = disciplines.filter(d=>career.disciplines.includes(d.id));
  const doneDiscs = careerDiscs.filter(d=>completed.has(d.id));
  const missingDiscs = careerDiscs.filter(d=>!completed.has(d.id));
  const nextUnlocked = missingDiscs.filter(d=>isUnlocked(d));
  const stillBlocked = missingDiscs.filter(d=>!isUnlocked(d));
  const pct = Math.round((doneDiscs.length/Math.max(careerDiscs.length,1))*100);
  const doneFrac = doneDiscs.length/Math.max(careerDiscs.length,1);
  const radarData = career.competencies.map((name,i)=>({ name,value:Math.min(5,Math.max(1,Math.round(career.compWeights[i]*doneFrac+0.5))) }));
  const demandColor = { "Muito Alta":"#047857","Alta":"#1d4ed8","Média":"#b45309" };
  
  return (
    <div className="fade-in" style={{ padding:"24px 28px",overflowY:"auto",height:"100%" }}>
      <div style={{ marginBottom:22 }}>
        <h1 style={{ fontFamily:"'DM Serif Display',serif",fontSize:24,fontWeight:400,color:"#1a1a2e" }}>Gap Analysis de Carreira</h1>
        <p style={{ fontSize:13,color:"#6b7280",marginTop:3 }}>Compare seu progresso com as exigências de cada trilha profissional</p>
      </div>
      <div style={{ display:"flex",gap:7,flexWrap:"wrap",marginBottom:22 }}>
        {careers.map(c=>{ const p=Math.round((disciplines.filter(d=>c.disciplines.includes(d.id)&&completed.has(d.id)).length/c.disciplines.length)*100) || 0; return (
          <button key={c.id} onClick={()=>setSelected(c.id)} className="nav-btn" style={{ padding:"7px 13px",borderRadius:8,fontSize:12,fontWeight:600,border:`1.5px solid ${selected===c.id?c.color:"#e5e7eb"}`,background:selected===c.id?`${c.color}10`:"#fff",color:selected===c.id?c.color:"#6b7280",display:"flex",alignItems:"center",gap:6 }}>
            <span>{c.icon}</span><span>{c.name}</span><span style={{ background:selected===c.id?c.color:"#e5e7eb",color:selected===c.id?"#fff":"#9ca3af",borderRadius:10,padding:"0 6px",fontSize:10 }}>{p}%</span>
          </button>
        );})}
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1.1fr 1fr 1fr",gap:12,marginBottom:14 }}>
        <div style={{ background:"#fff",borderRadius:12,border:"1px solid #e5e7eb",padding:18 }}>
          <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:12 }}>
            <div style={{ width:40,height:40,borderRadius:10,background:`${career.color}12`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20 }}>{career.icon}</div>
            <div><div style={{ fontSize:14,fontWeight:700,color:"#1a1a2e" }}>{career.name}</div><div style={{ fontSize:10,color:career.color,fontWeight:600 }}>TRILHA DE CARREIRA</div></div>
          </div>
          <p style={{ fontSize:12,color:"#6b7280",lineHeight:1.6,marginBottom:14 }}>{career.description}</p>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:14 }}>
            {[["DEMANDA",career.marketDemand,demandColor[career.marketDemand]],["SALÁRIO MÉDIO",career.avgSalary,"#1a1a2e"]].map(([l,v,clr])=>(
              <div key={l} style={{ background:"#f9fafb",borderRadius:8,padding:"8px 10px" }}><div style={{ fontSize:9,color:"#9ca3af",marginBottom:2 }}>{l}</div><div style={{ fontSize:11,fontWeight:700,color:clr }}>{v}</div></div>
            ))}
          </div>
          <div style={{ fontSize:10,fontWeight:600,color:"#9ca3af",letterSpacing:"0.4px",marginBottom:7 }}>SKILLS DO MERCADO</div>
          <div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>{career.topSkills.map(s=><span key={s} style={{ fontSize:10,padding:"3px 8px",background:`${career.color}10`,color:career.color,borderRadius:4,fontWeight:500 }}>{s}</span>)}</div>
        </div>
        <div style={{ background:"#fff",borderRadius:12,border:"1px solid #e5e7eb",padding:18,display:"flex",flexDirection:"column",alignItems:"center" }}>
          <div style={{ fontSize:11,fontWeight:600,color:"#9ca3af",letterSpacing:"0.5px",marginBottom:12,alignSelf:"flex-start" }}>SEU PERFIL DE COMPETÊNCIAS</div>
          <RadarChart data={radarData} color={career.color} size={185}/>
          <div style={{ textAlign:"center",marginTop:10 }}><div style={{ fontSize:26,fontWeight:700,color:career.color }}>{pct}%</div><div style={{ fontSize:11,color:"#9ca3af" }}>cobertura da trilha</div></div>
        </div>
        <div style={{ background:"#fff",borderRadius:12,border:"1px solid #e5e7eb",padding:18 }}>
          <div style={{ fontSize:11,fontWeight:600,color:"#9ca3af",letterSpacing:"0.5px",marginBottom:14 }}>PROGRESSO DETALHADO</div>
          <div style={{ marginBottom:16 }}>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}><span style={{ fontSize:12,fontWeight:600,color:"#1a1a2e" }}>Disciplinas concluídas</span><span style={{ fontSize:12,fontWeight:700,color:career.color }}>{doneDiscs.length}/{careerDiscs.length}</span></div>
            <div style={{ height:8,background:"#e5e7eb",borderRadius:4,overflow:"hidden" }}><div style={{ width:`${pct}%`,height:"100%",background:career.color,borderRadius:4,transition:"width 0.6s ease" }}/></div>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:16 }}>
            {[["Concluídas",doneDiscs.length,"#047857","#f0fdf4"],["Disponíveis",nextUnlocked.length,career.color,`${career.color}10`],["Bloqueadas",stillBlocked.length,"#9ca3af","#f9fafb"]].map(([l,v,c,bg])=>(
              <div key={l} style={{ background:bg,borderRadius:8,padding:"8px 6px",textAlign:"center" }}><div style={{ fontSize:20,fontWeight:700,color:c }}>{v}</div><div style={{ fontSize:9,color:c,fontWeight:500 }}>{l}</div></div>
            ))}
          </div>
          <div style={{ padding:"10px 12px",borderRadius:8,background:pct>=80?"#f0fdf4":pct>=40?"#eff6ff":"#fefce8",border:`1px solid ${pct>=80?"#bbf7d0":pct>=40?"#bfdbfe":"#fde68a"}` }}>
            <div style={{ fontSize:11,fontWeight:700,color:pct>=80?"#047857":pct>=40?"#1d4ed8":"#b45309",marginBottom:2 }}>{pct>=80?"✅ Pronto para o mercado!":pct>=40?"📚 Em bom progresso":"🌱 Início da jornada"}</div>
            <div style={{ fontSize:11,color:"#6b7280" }}>{pct>=80?"Você cobriu a maior parte das disciplinas desta trilha.":pct>=40?`Faltam ${missingDiscs.length} disciplinas para completar.`:"Complete as disciplinas disponíveis para avançar."}</div>
          </div>
        </div>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
        <div style={{ background:"#fff",borderRadius:12,border:"1px solid #e5e7eb",padding:18 }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12 }}>
            <div style={{ fontSize:11,fontWeight:600,color:"#9ca3af",letterSpacing:"0.5px" }}>DISPONÍVEIS AGORA</div>
            <span style={{ fontSize:10,background:`${career.color}12`,color:career.color,padding:"1px 8px",borderRadius:10,fontWeight:600 }}>{nextUnlocked.length} disciplinas</span>
          </div>
          {nextUnlocked.length===0?<p style={{ fontSize:12,color:"#9ca3af",fontStyle:"italic" }}>{missingDiscs.length===0?"🎉 Trilha completa!":"Complete os pré-requisitos primeiro."}</p>:(
            <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
              {nextUnlocked.map(disc=>(
                <div key={disc.id} onClick={()=>setSelectedDisc(disc.id)} style={{ display:"flex",alignItems:"center",gap:8,padding:"7px 9px",borderRadius:7,background:"#f9fafb",cursor:"pointer" }}>
                  <div style={{ width:7,height:7,borderRadius:2,background:career.color,flexShrink:0 }}/>
                  <span style={{ fontSize:12,color:"#374151",flex:1 }}>{disc.name}</span>
                  <span style={{ fontSize:10,color:"#9ca3af" }}>{disc.semester}º sem.</span>
                  <div onClick={e=>{e.stopPropagation();toggleCompleted(disc.id);}} style={{ width:18,height:18,borderRadius:4,border:`1.5px solid ${career.color}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:career.color,fontSize:12,fontWeight:700 }}>+</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ background:"#fff",borderRadius:12,border:"1px solid #e5e7eb",padding:18 }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12 }}>
            <div style={{ fontSize:11,fontWeight:600,color:"#9ca3af",letterSpacing:"0.5px" }}>JÁ CONCLUÍDAS NESTA TRILHA</div>
            <span style={{ fontSize:10,background:"#f0fdf4",color:"#047857",padding:"1px 8px",borderRadius:10,fontWeight:600 }}>{doneDiscs.length} disciplinas</span>
          </div>
          {doneDiscs.length===0?<p style={{ fontSize:12,color:"#9ca3af",fontStyle:"italic" }}>Nenhuma disciplina concluída nesta trilha ainda.</p>:(
            <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
              {doneDiscs.map(disc=>(
                <div key={disc.id} style={{ display:"flex",alignItems:"center",gap:8,padding:"5px 8px",borderRadius:7 }}>
                  <div style={{ width:16,height:16,borderRadius:4,background:"#1d4ed8",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}><svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.3" strokeLinecap="round"/></svg></div>
                  <span style={{ fontSize:12,color:"#374151" }}>{disc.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DiscCard({ disc, completed, isUnlocked, toggleCompleted, setSelectedDisc, selectedDisc }) {
  const done = completed.has(disc.id);
  const unlocked = isUnlocked(disc);
  const color = areaColors[disc.area] || "#94a3b8";
  const isSelected = selectedDisc === disc.id;
  return (
    <div className="disc-card" onClick={()=>setSelectedDisc(disc.id)}
      style={{ background:done?T.grad1:"#fff", border:`1.5px solid ${isSelected?(done?"rgba(255,255,255,0.4)":T.primary):done?"transparent":unlocked?T.border:"#f1f5f9"}`,
        borderRadius:12, padding:"12px 12px 10px", opacity:!unlocked&&!done?0.5:1,
        boxShadow:done?T.shadowMd:isSelected?`0 0 0 2px ${T.primary}33`:T.shadow }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:8 }}>
        <div style={{ padding:"2px 7px", background:done?"rgba(255,255,255,0.18)":`${color}12`, borderRadius:4, fontSize:9, fontWeight:700, color:done?"rgba(255,255,255,0.85)":color, maxWidth:"80%", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", letterSpacing:"0.3px" }}>
          {disc.area.toUpperCase()}
        </div>
        <div className="check-anim" onClick={e=>{e.stopPropagation();if(unlocked||done)toggleCompleted(disc.id);}}
          style={{ width:20, height:20, borderRadius:5, border:done?"none":`1.5px solid ${unlocked?T.border:"#e2e8f0"}`,
            background:done?"rgba(255,255,255,0.25)":"transparent", display:"flex", alignItems:"center", justifyContent:"center",
            cursor:unlocked||done?"pointer":"default", flexShrink:0, color:"#fff" }}>
          {done && <Icon.Check/>}
        </div>
      </div>
      <div style={{ fontSize:12, fontWeight:500, color:done?"#fff":unlocked?T.text:T.subtle, lineHeight:1.4, marginBottom:9, minHeight:34 }}>
        {disc.name}
      </div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontSize:10, color:done?"rgba(255,255,255,0.6)":T.subtle }}>{disc.ch>0?`${disc.ch}h`:"—"} · {disc.semester}º sem.</span>
        {!unlocked&&!done && <span style={{ color:T.subtle, display:"flex" }}><Icon.Lock/></span>}
        {unlocked&&!done && <span style={{ fontSize:9, fontWeight:700, color:T.primary, background:`${T.primary}12`, padding:"2px 6px", borderRadius:4 }}>LIVRE</span>}
      </div>
    </div>
  );
}

// ── Vagas View ───────────────────────────────────────────────────────────────
function VagasView({ user, completed, isCoord, vagas, onAddVaga, onDeleteVaga, onCandidatar, candidaturas, careers = [] }) {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("todas");
  const [form, setForm] = useState({ titulo:"",empresa:"",area:"",carreira:"",semestre_min:1,descricao:"",salario:"",prazo:"",link_externo:"",tipo:"Estágio" });

  const TIPOS = ["Estágio","Emprego","Trainee","Freelance"];

  const handleSubmit = async () => {
    if (!form.titulo || !form.empresa) return;
    await onAddVaga({ ...form, criadoEm: new Date().toISOString() });
    setForm({ titulo:"",empresa:"",area:"",carreira:"",semestre_min:1,descricao:"",salario:"",prazo:"",link_externo:"",tipo:"Estágio" });
    setShowForm(false);
  };

  const getMatch = (vaga) => {
    if (!vaga.carreira) return null;
    const career = careers.find(c => c.id === vaga.carreira);
    if (!career || !career.disciplines.length) return null;
    const done = career.disciplines.filter(id => completed.has(id)).length;
    return Math.round((done / career.disciplines.length) * 100);
  };

  const myCands = new Set(candidaturas.filter(c => c.uid === user.uid).map(c => c.vagaId));

  const filtered = vagas.filter(v => {
    if (filter === "minhas") return myCands.has(v.id);
    if (filter === "match") { const m = getMatch(v); return m !== null && m >= 50; }
    return true;
  });

  const matchColor = m => m >= 75 ? "#047857" : m >= 50 ? "#1d4ed8" : m >= 25 ? "#b45309" : "#9ca3af";

  return (
    <div className="fade-in" style={{ padding:"24px 28px", overflowY:"auto", height:"100%" }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:22 }}>
        <div>
          <h1 style={{ fontFamily:"'DM Serif Display',serif", fontSize:24, fontWeight:400, color:"#1a1a2e" }}>Vagas de Estágio e Emprego</h1>
          <p style={{ fontSize:13, color:"#6b7280", marginTop:3 }}>Oportunidades selecionadas pela coordenação</p>
        </div>
        {isCoord && (
          <button onClick={() => setShowForm(!showForm)} style={{ padding:"9px 16px", borderRadius:8, border:"none", background:"#1d4ed8", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer" }}>
            + Nova Vaga
          </button>
        )}
      </div>

      {isCoord && showForm && (
        <div style={{ background:"#fff", borderRadius:12, border:"1px solid #bfdbfe", padding:20, marginBottom:20 }}>
          <div style={{ fontSize:13, fontWeight:700, color:"#1a1a2e", marginBottom:14 }}>Nova Vaga</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:10 }}>
            <input placeholder="Título da vaga*" value={form.titulo} onChange={e=>setForm(f=>({...f,titulo:e.target.value}))} style={{ padding:"8px 10px", borderRadius:7, border:"1px solid #d1d5db", fontSize:12 }}/>
            <input placeholder="Empresa*" value={form.empresa} onChange={e=>setForm(f=>({...f,empresa:e.target.value}))} style={{ padding:"8px 10px", borderRadius:7, border:"1px solid #d1d5db", fontSize:12 }}/>
            <select value={form.tipo} onChange={e=>setForm(f=>({...f,tipo:e.target.value}))} style={{ padding:"8px 10px", borderRadius:7, border:"1px solid #d1d5db", fontSize:12, background:"#fff" }}>
              {TIPOS.map(t=><option key={t}>{t}</option>)}
            </select>
            <select value={form.carreira} onChange={e=>setForm(f=>({...f,carreira:e.target.value}))} style={{ padding:"8px 10px", borderRadius:7, border:"1px solid #d1d5db", fontSize:12, background:"#fff" }}>
              <option value="">Trilha de carreira (opcional)</option>
              {careers.map(c=><option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
            <select value={form.semestre_min} onChange={e=>setForm(f=>({...f,semestre_min:Number(e.target.value)}))} style={{ padding:"8px 10px", borderRadius:7, border:"1px solid #d1d5db", fontSize:12, background:"#fff" }}>
              {[1,2,3,4,5,6,7,8].map(s=><option key={s} value={s}>{s}º semestre (mínimo)</option>)}
            </select>
            <input placeholder="Salário / Bolsa (ex: R$ 1.500)" value={form.salario} onChange={e=>setForm(f=>({...f,salario:e.target.value}))} style={{ padding:"8px 10px", borderRadius:7, border:"1px solid #d1d5db", fontSize:12 }}/>
            <input type="date" placeholder="Prazo" value={form.prazo} onChange={e=>setForm(f=>({...f,prazo:e.target.value}))} style={{ padding:"8px 10px", borderRadius:7, border:"1px solid #d1d5db", fontSize:12 }}/>
            <input placeholder="Link externo (opcional)" value={form.link_externo} onChange={e=>setForm(f=>({...f,link_externo:e.target.value}))} style={{ padding:"8px 10px", borderRadius:7, border:"1px solid #d1d5db", fontSize:12 }}/>
          </div>
          <textarea placeholder="Descrição da vaga, requisitos, benefícios..." value={form.descricao} onChange={e=>setForm(f=>({...f,descricao:e.target.value}))} rows={3} style={{ width:"100%", padding:"8px 10px", borderRadius:7, border:"1px solid #d1d5db", fontSize:12, resize:"vertical", fontFamily:"inherit", marginBottom:10 }}/>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={handleSubmit} style={{ flex:1, padding:"9px", borderRadius:7, border:"none", background:"#1d4ed8", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer" }}>Publicar Vaga</button>
            <button onClick={()=>setShowForm(false)} style={{ padding:"9px 18px", borderRadius:7, border:"1px solid #e5e7eb", background:"#fff", fontSize:13, color:"#6b7280", cursor:"pointer" }}>Cancelar</button>
          </div>
        </div>
      )}

      <div style={{ display:"flex", gap:6, marginBottom:18 }}>
        {[["todas","Todas as vagas"],["match","Match ≥ 50%"],["minhas","Minhas candidaturas"]].map(([v,l])=>(
          <button key={v} onClick={()=>setFilter(v)} className="nav-btn" style={{ padding:"6px 14px", borderRadius:7, border:`1.5px solid ${filter===v?"#1d4ed8":"#e5e7eb"}`, background:filter===v?"#eff6ff":"#fff", color:filter===v?"#1d4ed8":"#6b7280", fontSize:12, fontWeight:filter===v?600:400 }}>{l}</button>
        ))}
        <div style={{ marginLeft:"auto", fontSize:12, color:"#9ca3af", display:"flex", alignItems:"center" }}>{filtered.length} vaga{filtered.length!==1?"s":""}</div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign:"center", padding:"48px 0", color:"#9ca3af" }}>
          <div style={{ fontSize:32, marginBottom:8 }}>📋</div>
          <div style={{ fontSize:14, fontWeight:500 }}>{vagas.length === 0 ? "Nenhuma vaga cadastrada ainda." : "Nenhuma vaga encontrada com esse filtro."}</div>
          {isCoord && vagas.length === 0 && <div style={{ fontSize:12, marginTop:4 }}>Clique em "+ Nova Vaga" para começar.</div>}
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(340px, 1fr))", gap:14 }}>
          {filtered.map(vaga => {
            const match = getMatch(vaga);
            const career = vaga.carreira ? careers.find(c=>c.id===vaga.carreira) : null;
            const jaCandidatou = myCands.has(vaga.id);
            const candCount = candidaturas.filter(c=>c.vagaId===vaga.id).length;
            const prazoExpirado = vaga.prazo && new Date(vaga.prazo) < new Date();
            return (
              <div key={vaga.id} style={{ background:"#fff", borderRadius:12, border:`1.5px solid ${jaCandidatou?"#bfdbfe":"#e5e7eb"}`, padding:18, display:"flex", flexDirection:"column", gap:10, position:"relative" }}>
                {jaCandidatou && <div style={{ position:"absolute", top:12, right:12, fontSize:10, fontWeight:700, background:"#eff6ff", color:"#1d4ed8", padding:"2px 8px", borderRadius:6 }}>✓ Candidatado</div>}

                <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                  <div style={{ width:40, height:40, borderRadius:9, background:"#f3f4f6", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>🏢</div>
                  <div style={{ flex:1, paddingRight: jaCandidatou ? 80 : 0 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:"#1a1a2e", lineHeight:1.3 }}>{vaga.titulo}</div>
                    <div style={{ fontSize:12, color:"#6b7280", marginTop:2 }}>{vaga.empresa}</div>
                  </div>
                </div>

                <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                  <span style={{ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:5, background:"#f3f4f6", color:"#374151" }}>{vaga.tipo}</span>
                  {career && <span style={{ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:5, background:`${career.color}12`, color:career.color }}>{career.icon} {career.name}</span>}
                  {vaga.semestre_min > 1 && <span style={{ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:5, background:"#fef3c7", color:"#b45309" }}>A partir do {vaga.semestre_min}º sem.</span>}
                  {prazoExpirado && <span style={{ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:5, background:"#fee2e2", color:"#dc2626" }}>Prazo encerrado</span>}
                </div>

                {vaga.descricao && <p style={{ fontSize:12, color:"#6b7280", lineHeight:1.5, margin:0 }}>{vaga.descricao}</p>}

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                  {vaga.salario && <div style={{ background:"#f9fafb", borderRadius:7, padding:"6px 9px" }}><div style={{ fontSize:9, color:"#9ca3af" }}>SALÁRIO / BOLSA</div><div style={{ fontSize:12, fontWeight:600, color:"#1a1a2e" }}>{vaga.salario}</div></div>}
                  {vaga.prazo && <div style={{ background:"#f9fafb", borderRadius:7, padding:"6px 9px" }}><div style={{ fontSize:9, color:"#9ca3af" }}>PRAZO</div><div style={{ fontSize:12, fontWeight:600, color: prazoExpirado?"#dc2626":"#1a1a2e" }}>{new Date(vaga.prazo+"T12:00:00").toLocaleDateString("pt-BR")}</div></div>}
                </div>

                {match !== null && (
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ flex:1, height:5, background:"#e5e7eb", borderRadius:3, overflow:"hidden" }}><div style={{ width:`${match}%`, height:"100%", background:matchColor(match), borderRadius:3 }}/></div>
                    <span style={{ fontSize:11, fontWeight:700, color:matchColor(match), minWidth:40 }}>{match}% match</span>
                  </div>
                )}

                <div style={{ display:"flex", gap:7, alignItems:"center", marginTop:2 }}>
                  {!prazoExpirado && !isCoord && (
                    <button onClick={()=>!jaCandidatou&&onCandidatar(vaga.id)} disabled={jaCandidatou} style={{ flex:1, padding:"8px", borderRadius:7, border:"none", background:jaCandidatou?"#f3f4f6":"#1d4ed8", color:jaCandidatou?"#9ca3af":"#fff", fontSize:12, fontWeight:600, cursor:jaCandidatou?"default":"pointer" }}>
                      {jaCandidatou ? "✓ Candidatura enviada" : "Candidatar-se"}
                    </button>
                  )}
                  {vaga.link_externo && (
                    <a href={vaga.link_externo} target="_blank" rel="noreferrer" style={{ padding:"8px 12px", borderRadius:7, border:"1px solid #e5e7eb", background:"#fff", fontSize:12, color:"#6b7280", textDecoration:"none", fontWeight:500 }}>🔗 Ver site</a>
                  )}
                  {isCoord && (
                    <>
                      <div style={{ fontSize:11, color:"#9ca3af", flex:1 }}>{candCount} candidatura{candCount!==1?"s":""}</div>
                      <button onClick={()=>onDeleteVaga(vaga.id)} style={{ padding:"6px 10px", borderRadius:6, border:"1px solid #fee2e2", background:"#fff", color:"#dc2626", fontSize:11, cursor:"pointer" }}>Remover</button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Dados para criação dos novos cursos (Administração fica intacto) ────────
// Schema compatível com o app: careers (name, description, icon, color, competencies, compWeights, topSkills, marketDemand, avgSalary)
// disciplines (id, name, semester, prereqs, competencies, area, ch)
const NOVOS_CURSOS_DEMO = {
  direito: {
    nome: "Direito",
    careers: [
      {
        id: "adv-civilista", name: "Advogado Civilista", description: "Atuação em contratos, responsabilidade civil e direito de família.",
        icon: "⚖️", color: "#6366f1",
        competencies: ["Contratos", "Responsabilidade Civil", "Hermenêutica", "Compliance", "Litígio"],
        compWeights: [0.3, 0.25, 0.2, 0.15, 0.1],
        topSkills: ["Contratos", "Código Civil", "Responsabilidade Civil", "Audiências", "Pareceres"],
        marketDemand: "Alta", avgSalary: "R$ 5.500 – R$ 15.000",
        disciplines: ["dir-1", "dir-2", "dir-3", "dir-4"]
      },
      {
        id: "analista-juridico", name: "Analista Jurídico", description: "Análise de processos, pareceres e compliance em empresas.",
        icon: "📋", color: "#047857",
        competencies: ["Compliance", "Análise de Processos", "Pareceres", "Gestão Documental", "Direito Empresarial"],
        compWeights: [0.3, 0.25, 0.2, 0.15, 0.1],
        topSkills: ["Compliance", "Pareceres", "Análise Contratual", "Gestão Documental", "Direito Empresarial"],
        marketDemand: "Muito Alta", avgSalary: "R$ 4.000 – R$ 12.000",
        disciplines: ["dir-1", "dir-2", "dir-3", "dir-4"]
      }
    ],
    disciplines: [
      { id: "dir-1", name: "Introdução ao Estudo do Direito", semester: 1, prereqs: [], competencies: ["Teoria Geral", "Hermenêutica", "Fontes do Direito"], area: "Formação Básica", ch: 80 },
      { id: "dir-2", name: "Teoria Geral do Estado e Const.", semester: 1, prereqs: [], competencies: ["Soberania", "Divisão de Poderes"], area: "Formação Básica", ch: 80 },
      { id: "dir-3", name: "Direito Constitucional I", semester: 2, prereqs: ["dir-2"], competencies: ["Direitos Fundamentais", "Controle de Constitucionalidade"], area: "Direito e Legislação", ch: 80 },
      { id: "dir-4", name: "Direito Civil: Obrigações", semester: 2, prereqs: ["dir-1"], competencies: ["Contratos", "Código Civil", "Adimplemento"], area: "Direito e Legislação", ch: 80 }
    ]
  },
  fisioterapia: {
    nome: "Fisioterapia",
    careers: [
      {
        id: "fisio-esportiva", name: "Fisioterapeuta Esportivo", description: "Prevenção e reabilitação de lesões em atletas de alta performance.",
        icon: "🏃", color: "#dc2626",
        competencies: ["Biomecânica", "Reabilitação", "Avaliação Funcional", "Treinamento", "Prevenção"],
        compWeights: [0.25, 0.25, 0.2, 0.15, 0.15],
        topSkills: ["Reabilitação Esportiva", "Taping", "Análise do Movimento", "Eletroterapia", "Exercícios Terapêuticos"],
        marketDemand: "Alta", avgSalary: "R$ 4.000 – R$ 10.000",
        disciplines: ["fis-1", "fis-2", "fis-3", "fis-4", "fis-5", "fis-6"]
      },
      {
        id: "fisio-hospitalar", name: "Fisioterapeuta Hospitalar / UTI", description: "Atendimento a pacientes críticos e reabilitação cardiorrespiratória.",
        icon: "🏥", color: "#1d4ed8",
        competencies: ["Fisiologia", "Reabilitação", "Avaliação Funcional", "Ventilação Mecânica", "Cuidados Intensivos"],
        compWeights: [0.25, 0.25, 0.2, 0.15, 0.15],
        topSkills: ["Ventilação Mecânica", "Fisioterapia UTI", "Ausculta Pulmonar", "Drenagem", "Cuidados Intensivos"],
        marketDemand: "Muito Alta", avgSalary: "R$ 5.000 – R$ 12.000",
        disciplines: ["fis-1", "fis-2", "fis-3", "fis-4", "fis-5", "fis-6"]
      }
    ],
    disciplines: [
      { id: "fis-1", name: "Anatomia Humana", semester: 1, prereqs: [], competencies: ["Osteologia", "Miologia", "Sistema Nervoso"], area: "Formação Básica", ch: 100 },
      { id: "fis-2", name: "Fisiologia Humana", semester: 1, prereqs: [], competencies: ["Fisiologia Celular", "Sistema Cardiorrespiratório"], area: "Formação Básica", ch: 80 },
      { id: "fis-3", name: "Cinesiologia e Biomecânica", semester: 2, prereqs: ["fis-1"], competencies: ["Análise do Movimento", "Artrocinemática"], area: "Formação Básica", ch: 80 },
      { id: "fis-4", name: "Avaliação Fisioterapêutica", semester: 2, prereqs: ["fis-2"], competencies: ["Anamnese", "Testes Ortopédicos", "Goniometria"], area: "Formação Básica", ch: 60 },
      { id: "fis-5", name: "Fisioterapia Cardiorrespiratória", semester: 3, prereqs: ["fis-3"], competencies: ["Reabilitação Pulmonar", "VNI", "Ausculta"], area: "Especialização", ch: 60 },
      { id: "fis-6", name: "Estágio Supervisionado I", semester: 4, prereqs: ["fis-4", "fis-5"], competencies: ["Atendimento Clínico", "Prática Assistencial"], area: "Prática", ch: 120 }
    ]
  }
};

const LISTA_CURSOS = [
  { id: "ADM", nome: "Administração" },
  { id: "direito", nome: "Direito" },
  { id: "fisioterapia", nome: "Fisioterapia" }
];

// Função para enviar APENAS Direito e Fisioterapia para o Firebase
// O hook useCourseData busca em subcoleções:
//   courses/[cursoId]/disciplinas  (disciplinas)
//   courses/[cursoId]/careers      (careers)
const cadastrarNovosCursos = async () => {
  try {
    for (const [idCurso, dados] of Object.entries(NOVOS_CURSOS_DEMO)) {
      // Cria as disciplinas como documentos individuais na subcoleção
      for (const disc of dados.disciplines) {
        const discRef = doc(db, "courses", idCurso, "disciplinas", disc.id);
        await setDoc(discRef, {
          id: disc.id,
          name: disc.name,
          semester: disc.semester,
          prereqs: disc.prereqs || [],
          competencies: disc.competencies || [],
          area: disc.area || "Formação Básica",
          ch: disc.ch || 0
        }, { merge: true });
      }

      // Cria as carreiras como documentos individuais na subcoleção
      for (const career of dados.careers) {
        const careerRef = doc(db, "courses", idCurso, "careers", career.id);
        await setDoc(careerRef, {
          id: career.id,
          name: career.name,
          description: career.description || "",
          icon: career.icon || "📚",
          color: career.color || "#6366f1",
          competencies: career.competencies || [],
          compWeights: career.compWeights || [0.2, 0.2, 0.2, 0.2, 0.2],
          topSkills: career.topSkills || [],
          marketDemand: career.marketDemand || "Média",
          avgSalary: career.avgSalary || "—",
          disciplines: career.disciplines || []
        }, { merge: true });
      }
    }
    alert("✨ Sucesso! Direito e Fisioterapia foram adicionados no Firebase.");
  } catch (error) {
    console.error("Erro ao cadastrar novos cursos:", error);
    alert("Ocorreu um erro ao cadastrar os novos cursos.");
  }
};
// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  // 1. Nossos hooks
  const { user, userData, isCoord, authLoading, loginLoading, login, logout } = useAuth();
  
  // NOVO: Estado para trocar de curso no dropdown (padrão é administração)
  const [cursoId, setCursoId] = useState("ADM");

  const { disciplines, careers, dataLoading } = useCourseData(cursoId);
  const { completed, experiences, saving, loadingProgress, toggleCompleted, addExperience, deleteExperience } = useStudentProgress(userData, disciplines, careers);
  // 2. Estados da Interface
  const [mainView, setMainView] = useState("mapa");
  const [activeView, setActiveView] = useState("semestres");
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [selectedDisc, setSelectedDisc] = useState(null);

  // 3. Estados Adicionais (Vagas e Alunos)
  const [vagas, setVagas] = useState([]);
  const [candidaturas, setCandidaturas] = useState([]);
  const [allStudents, setAllStudents] = useState([]);

  useEffect(() => {
    if (!user) return;
    const fetchExtras = async () => {
      const vSnap = await getDocs(collection(db, "vagas"));
      setVagas(vSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      
      const cSnap = await getDocs(collection(db, "candidaturas"));
      setCandidaturas(cSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      if (isCoord && cursoId) {
        const usersSnap = await getDocs(collection(db, "users"));
        const progressSnap = await getDocs(collection(db, "progress"));
        const expsSnap = await getDocs(collection(db, "experiences"));
        
        const progressMap = {};
        progressSnap.docs.forEach(d => { progressMap[d.id] = d.data(); });
        
        const expCountMap = {};
        expsSnap.docs.forEach(d => {
          const uid = d.data().uid;
          expCountMap[uid] = (expCountMap[uid] || 0) + 1;
        });
        
        const students = usersSnap.docs
          .map(d => d.data())
          .filter(s => s.role !== "coordenador" && s.cursoId === cursoId)
          .map(s => {
            const prog = progressMap[s.uid];
            let completedSet = new Set();
            if (prog?.completedMeta) {
              completedSet = new Set(Object.keys(prog.completedMeta));
            } else if (prog?.completed) {
              completedSet = new Set(prog.completed);
            }
            const progressPct = disciplines.length ? Math.round((completedSet.size / disciplines.length) * 100) : 0;
            return {
              ...s,
              progress: progressPct,
              completedCount: completedSet.size,
              experienceCount: expCountMap[s.uid] || 0,
              competencyCount: getAutoCompetencies(completedSet, disciplines).length,
              daysSinceActivity: 0 // Simplificado
            };
          });
        setAllStudents(students);
      }
    };
    fetchExtras();
  }, [user, isCoord, cursoId, disciplines]);

  // Funções de Vagas
  const handleAddVaga = async (form) => {
    const ref = await addDoc(collection(db, "vagas"), { ...form, criadoPor: user.uid });
    setVagas(prev => [...prev, { id: ref.id, ...form }]);
  };
  const handleDeleteVaga = async (id) => {
    await deleteDoc(doc(db, "vagas", id));
    setVagas(prev => prev.filter(v => v.id !== id));
  };
  const handleCandidatar = async (vagaId) => {
    const ref = await addDoc(collection(db, "candidaturas"), { vagaId, uid: user.uid, userName: user.displayName, userEmail: user.email, candidatadoEm: new Date().toISOString() });
    setCandidaturas(prev => [...prev, { id: ref.id, vagaId, uid: user.uid }]);
  };
  const handleShareLink = () => {
    const url = `${window.location.origin}?portfolio=${user?.uid}`;
    navigator.clipboard.writeText(url).then(() => alert("Link copiado! Compartilhe com recrutadores ou coordenadores."));
  };

  // 4. Lógicas de Progresso e Filtros dinâmicos
  const isUnlocked = disc => disc.prereqs.every(p => completed.has(p));
  const totalCH = disciplines.reduce((a, d) => a + d.ch, 0);
  const completedCH = disciplines.filter(d => completed.has(d.id)).reduce((a, d) => a + d.ch, 0);
  const totalProgress = disciplines.length ? Math.round((completed.size / disciplines.length) * 100) : 0;

  const getAreaProgress = area => { 
    const d = disciplines.filter(x => x.area === area); 
    return { done: d.filter(x => completed.has(x.id)).length, total: d.length }; 
  };
  const getCareerProgress = career => 
    career.disciplines.length ? Math.round((career.disciplines.filter(id => completed.has(id)).length / career.disciplines.length) * 100) : 0;
  const getSemesterProgress = sem => { 
    const d = disciplines.filter(x => x.semester === sem); 
    return { done: d.filter(x => completed.has(x.id)).length, total: d.length }; 
  };

  const recommendations = useMemo(() => disciplines.filter(d => !completed.has(d.id) && isUnlocked(d)).slice(0, 5), [completed, disciplines]);

  const filteredDiscs = useMemo(() => {
    if (activeView === "trilhas" && selectedCareer) { 
      const c = careers.find(x => x.id === selectedCareer); 
      return c ? disciplines.filter(d => c.disciplines.includes(d.id)) : disciplines; 
    }
    if (activeView === "areas" && selectedArea) return disciplines.filter(d => d.area === selectedArea);
    return disciplines;
  }, [activeView, selectedArea, selectedCareer, disciplines, careers]);

  const selectedDiscInfo = selectedDisc ? disciplines.find(d => d.id === selectedDisc) : null;

  const areas = [...new Set((disciplines || []).map(d => d.area))];
  const semesters = [...new Set((disciplines || []).map(d => d.semester))].sort((a,b) => a - b);
  
  // Menu lateral
  const navItems = [
    ["mapa", "Mapa de Disciplinas", Icon.Map],
    ["gap", "Gap Analysis", Icon.ChartBar],
    ["portfolio", "Meu Portfólio", Icon.Brain],
    ["vagas", "Vagas", Icon.Briefcase],
    ...(isCoord ? [
      ["coord", "Alunos", Icon.Users],
      ["gestao", "Gestão do Curso", Icon.Academic]
    ] : []),
  ];

  // 5. Telas de Loading e Login
  if (authLoading || dataLoading || loadingProgress) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", color:"#9ca3af", fontFamily:"sans-serif" }}>
        Carregando o ecossistema...
      </div>
    );
  }
  
  if (!user) {
    return <LoginScreen onLogin={login} loading={loginLoading} />;
  }

  return (
    <div style={{ fontFamily:"'DM Sans','Inter','Helvetica Neue',sans-serif", background:T.bg, minHeight:"100vh", color:T.text, display:"flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Serif+Display&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:10px}
        ::-webkit-scrollbar-thumb:hover{background:#94a3b8}

        .disc-card{transition:all 0.18s ease;cursor:pointer}
        .disc-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(99,102,241,0.14)!important}
        .nav-item{transition:all 0.15s ease;cursor:pointer;border:none;background:none;width:100%;text-align:left;border-radius:10px}
        .nav-item:hover{background:rgba(99,102,241,0.07)}
        .nav-item.active{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff!important;box-shadow:0 4px 14px rgba(99,102,241,0.35)}
        .nav-item.active svg{color:#fff!important}
        .btn-primary{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:9px;padding:9px 18px;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.18s ease;font-family:inherit;display:inline-flex;align-items:center;gap:6px}
        .btn-primary:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(99,102,241,0.35)}
        .btn-ghost{background:#fff;color:#475569;border:1.5px solid #e2e8f0;border-radius:9px;padding:8px 16px;font-size:13px;font-weight:500;cursor:pointer;transition:all 0.15s ease;font-family:inherit;display:inline-flex;align-items:center;gap:6px}
        .btn-ghost:hover{border-color:#6366f1;color:#6366f1;background:#f5f3ff}
        .card{background:#fff;border-radius:14px;border:1px solid #e2e8f0;box-shadow:0 1px 3px rgba(0,0,0,0.05)}
        .badge{display:inline-flex;align-items:center;padding:2px 9px;border-radius:20px;font-size:10px;font-weight:600;letter-spacing:0.3px}
        .fade-in{animation:fadeIn 0.22s ease}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .check-anim{transition:transform 0.15s ease}
        .check-anim:hover{transform:scale(1.2)}
        input,select,textarea{font-family:inherit;outline:none}
        input:focus,select:focus,textarea:focus{border-color:#6366f1!important;box-shadow:0 0 0 3px rgba(99,102,241,0.12)}
        @media print{.no-print{display:none!important}}
      `}</style>

      {/* ── SIDEBAR ── */}
      <div style={{ width:232, background:"#fff", borderRight:`1px solid ${T.border}`, display:"flex", flexDirection:"column", height:"100vh", position:"sticky", top:0, flexShrink:0, boxShadow:"2px 0 12px rgba(0,0,0,0.04)" }}>
        {/* Logo */}
        <div style={{ padding:"20px 18px 16px", borderBottom:`1px solid ${T.border}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <img src={LOGO_B64} alt="UNIARA" style={{ height:36, objectFit:"contain" }}/>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:T.text, lineHeight:1.2 }}>Mapa de</div>
              <div style={{ fontSize:12, fontWeight:700, color:T.primary, lineHeight:1.2 }}>Aprendizagem</div>
              <div style={{ fontSize:9, color:T.subtle, fontWeight:500, marginTop:1 }}>ECOSSISTEMA · UNIARA</div>
            </div>
          </div>
        </div>

        {/* --- SELETOR DE CURSOS --- */}
        <div style={{ padding:"12px 16px", borderBottom:`1px solid ${T.border}` }}>
          <label style={{ fontSize:9, fontWeight:700, color:T.subtle, textTransform:"uppercase", letterSpacing:"0.8px", display:"block", marginBottom:8 }}>CURSO</label>
          <select
            value={cursoId}
            onChange={(e) => setCursoId(e.target.value)}
            style={{
              width:"100%",
              padding:"8px 10px",
              borderRadius:6,
              border:`1px solid ${T.border}`,
              background:"#fff",
              fontSize:13,
              fontWeight:600,
              color:T.text,
              outline:"none",
              cursor:"pointer",
              appearance:"auto"
            }}
          >
            {LISTA_CURSOS.map(c => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
          {isCoord && (
            <button
              onClick={cadastrarNovosCursos}
              style={{
                marginTop:8,
                width:"100%",
                padding:"7px 10px",
                background:"#f8fafc",
                border:`1px solid ${T.border}`,
                borderRadius:6,
                fontSize:11,
                fontWeight:500,
                color:T.muted,
                cursor:"pointer",
                transition:"all 0.2s"
              }}
              onMouseEnter={e => { e.currentTarget.style.background=T.grad1; e.currentTarget.style.color="#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background="#f8fafc"; e.currentTarget.style.color=T.muted; }}
            >
              ➕ Criar Direito e Fisioterapia no Banco
            </button>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:"12px 10px", overflowY:"auto" }}>
          <div style={{ fontSize:9, fontWeight:700, color:T.subtle, letterSpacing:"0.8px", padding:"4px 10px 8px" }}>NAVEGAÇÃO</div>
          {navItems.map(([v, l, IconComp]) => (
            <button key={v} className={`nav-item${mainView===v?" active":""}`} onClick={()=>setMainView(v)}
              style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", marginBottom:3, color:mainView===v?"#fff":T.muted, fontSize:13, fontWeight:mainView===v?600:500 }}>
              <span style={{ color:mainView===v?"#fff":T.primary, flexShrink:0 }}><IconComp/></span>
              {l}
              {mainView===v && <span style={{ marginLeft:"auto" }}><Icon.Arrow/></span>}
            </button>
          ))}
        </nav>

        {/* Progress mini */}
        <div style={{ padding:"12px 16px", borderTop:`1px solid ${T.border}`, background:"#fafafa" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
            <span style={{ fontSize:11, color:T.muted, fontWeight:500 }}>Progresso geral</span>
            <span style={{ fontSize:12, fontWeight:700, color:T.primary }}>{totalProgress}%</span>
          </div>
          <div style={{ height:6, background:"#e2e8f0", borderRadius:3, overflow:"hidden" }}>
            <div style={{ width:`${totalProgress}%`, height:"100%", background:T.grad1, borderRadius:3, transition:"width 0.6s ease" }}/>
          </div>
          <div style={{ fontSize:10, color:T.subtle, marginTop:5 }}>{completed.size} de {disciplines.length} disciplinas</div>
        </div>

        {/* User */}
        <div style={{ padding:"12px 14px", borderTop:`1px solid ${T.border}`, display:"flex", alignItems:"center", gap:9 }}>
          {user.photoURL
            ? <img src={user.photoURL} style={{ width:32, height:32, borderRadius:"50%", border:`2px solid ${T.border}` }} alt=""/>
            : <div style={{ width:32, height:32, borderRadius:"50%", background:T.grad1, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"#fff" }}>{user.displayName?.[0]||"?"}</div>
          }
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:12, fontWeight:600, color:T.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {user.displayName?.split(" ")[0]}
              {isCoord && <span style={{ marginLeft:5, fontSize:9, background:T.grad1, color:"#fff", borderRadius:4, padding:"1px 6px" }}>COORD</span>}
            </div>
            <div style={{ fontSize:10, color:T.subtle, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user.email}</div>
          </div>
          <button onClick={logout} title="Sair" style={{ background:"none", border:"none", cursor:"pointer", color:T.subtle, padding:4, borderRadius:6, display:"flex", alignItems:"center" }} className="btn-ghost" onMouseEnter={e=>e.currentTarget.style.color=T.red} onMouseLeave={e=>e.currentTarget.style.color=T.subtle}>
            <Icon.Logout/>
          </button>
        </div>
      </div>

      {/* ── MAIN AREA ── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0, height:"100vh", overflow:"hidden" }}>
        {/* Topbar */}
        <div style={{ background:"#fff", borderBottom:`1px solid ${T.border}`, padding:"0 24px", height:54, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:T.text }}>{navItems.find(([v])=>v===mainView)?.[1]||""}</div>
            <div style={{ fontSize:11, color:T.subtle }}>
              {mainView==="mapa" && `${completed.size} disciplinas concluídas · ${completedCH}h`}
              {mainView==="gap" && "Analise seu alinhamento com o mercado"}
              {mainView==="portfolio" && "Seu portfólio acadêmico e profissional"}
              {mainView==="vagas" && `${vagas.length} vaga${vagas.length!==1?"s":""} disponível${vagas.length!==1?"is":""}`}
              {mainView==="coord" && `${allStudents.length} aluno${allStudents.length!==1?"s":""} cadastrado${allStudents.length!==1?"s":""}`}
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {saving && <span style={{ fontSize:11, color:T.subtle, display:"flex", alignItems:"center", gap:4 }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:T.amber, display:"inline-block", animation:"pulse 1s infinite" }}/>
              Salvando...
            </span>}
            <div style={{ background:`${T.primary}12`, borderRadius:8, padding:"4px 12px", display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:11, fontWeight:700, color:T.primary }}>{completed.size}<span style={{ fontWeight:400, color:T.subtle }}>/{disciplines.length}</span></span>
              <span style={{ fontSize:10, color:T.subtle }}>discs.</span>
              <span style={{ width:1, height:12, background:T.border }}/>
              <span style={{ fontSize:11, fontWeight:700, color:T.cyan }}>{completedCH}<span style={{ fontWeight:400, color:T.subtle }}>h</span></span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex:1, overflowY:"auto" }}>
         {mainView === "gestao" && isCoord && (
  <GestaoCursoView 
    cursoId={cursoId} 
    disciplines={disciplines} 
    careers={careers} 
    isCoord={isCoord}
    perfilEgresso={userData?.perfil_egresso || ""}
    competenciasGerais={userData?.competencias_gerais || []}
  />
)}
          {mainView==="vagas" && (
            <div style={{ height:"calc(100vh - 62px)", overflowY:"auto" }}>
              <VagasView user={user} completed={completed} isCoord={isCoord} vagas={vagas} onAddVaga={handleAddVaga} onDeleteVaga={handleDeleteVaga} onCandidatar={handleCandidatar} candidaturas={candidaturas} careers={careers} />
            </div>
          )}
          {mainView==="portfolio" && (
            <div style={{ height:"calc(100vh - 62px)",overflowY:"auto" }}>
              <PortfolioView user={user} completed={completed} experiences={experiences} onAddExperience={addExperience} onDeleteExperience={deleteExperience} onShareLink={handleShareLink} disciplines={disciplines} careers={careers} />
            </div>
          )}
          {mainView==="coord" && isCoord && (
            <div style={{ height:"calc(100vh - 62px)",overflowY:"auto" }}>
              <CoordDashboard allStudents={allStudents}/>
            </div>
          )}
          {mainView==="gap" && (
            <div style={{ height:"calc(100vh - 62px)",overflowY:"auto" }}>
              <GapAnalysis completed={completed} isUnlocked={isUnlocked} toggleCompleted={toggleCompleted} setSelectedDisc={id=>{setSelectedDisc(id);setMainView("mapa");}} disciplines={disciplines} careers={careers} />
            </div>
          )}
          {mainView==="mapa" && (
            <div style={{ display:"flex",height:"calc(100vh - 62px)" }}>
              {/* SIDEBAR DO MAPA */}
              <div style={{ width:248,background:"#fff",borderRight:"1px solid #e5e7eb",display:"flex",flexDirection:"column",overflow:"hidden",flexShrink:0 }}>
                <div style={{ padding:"12px 10px 0" }}>
                  <div style={{ background:"#f3f4f6",borderRadius:8,padding:3,display:"flex",gap:2 }}>
                    {[["semestres","Semestres"],["areas","Áreas"],["trilhas","Trilhas"]].map(([v,l])=>(
                      <button key={v} className="nav-btn" onClick={()=>{setActiveView(v);setSelectedArea(null);setSelectedCareer(null);}} style={{ flex:1,padding:"5px 0",borderRadius:6,background:activeView===v?"#fff":"transparent",boxShadow:activeView===v?"0 1px 3px rgba(0,0,0,0.1)":"none",fontSize:11,fontWeight:activeView===v?600:400,color:activeView===v?"#1a1a2e":"#6b7280" }}>{l}</button>
                    ))}
                  </div>
                </div>
                <div style={{ flex:1,overflowY:"auto",padding:"8px 8px" }}>
                  {activeView==="semestres" && semesters.map(s=>{const{done,total}=getSemesterProgress(s);const pct=total ? Math.round((done/total)*100) : 0;return(
                    <div key={s} style={{ padding:"7px 10px",borderRadius:7,marginBottom:2 }}>
                      <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}><span style={{ fontSize:12,fontWeight:500,color:"#374151" }}>{s}º Semestre</span><span style={{ fontSize:10,color:pct===100?"#047857":"#6b7280",fontWeight:pct===100?600:400 }}>{pct===100?"✓ ok":`${done}/${total}`}</span></div>
                      <div style={{ width:"100%",height:3,background:"#e5e7eb",borderRadius:2,overflow:"hidden" }}><div style={{ width:`${pct}%`,height:"100%",background:pct===100?"#047857":"#1d4ed8",borderRadius:2 }}/></div>
                    </div>
                  );})}
                  {activeView==="areas" && areas.map(area=>{const{done,total}=getAreaProgress(area);const pct=total ? Math.round((done/total)*100) : 0;const color=areaColors[area] || "#9ca3af";return(
                    <button key={area} className="sidebar-btn" onClick={()=>setSelectedArea(selectedArea===area?null:area)} style={{ padding:"8px 10px",borderRadius:7,background:selectedArea===area?`${color}10`:"transparent",marginBottom:2,border:selectedArea===area?`1px solid ${color}22`:"1px solid transparent", width:"100%", textAlign:"left" }}>
                      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4 }}><div style={{ display:"flex",alignItems:"center",gap:6 }}><div style={{ width:7,height:7,borderRadius:2,background:color,flexShrink:0 }}/><span style={{ fontSize:11,fontWeight:selectedArea===area?600:400,color:selectedArea===area?color:"#374151" }}>{area}</span></div><span style={{ fontSize:10,color:"#9ca3af" }}>{pct}%</span></div>
                      <div style={{ width:"100%",height:2,background:"#e5e7eb",borderRadius:2,overflow:"hidden" }}><div style={{ width:`${pct}%`,height:"100%",background:color }}/></div>
                    </button>
                  );})}
                  {activeView==="trilhas" && careers.map(career=>{const pct=getCareerProgress(career);return(
                    <button key={career.id} className="sidebar-btn" onClick={()=>setSelectedCareer(selectedCareer===career.id?null:career.id)} style={{ padding:"10px 10px",borderRadius:7,background:selectedCareer===career.id?`${career.color}10`:"transparent",marginBottom:3,border:selectedCareer===career.id?`1px solid ${career.color}22`:"1px solid transparent", width:"100%", textAlign:"left" }}>
                      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:5 }}><div style={{ display:"flex",alignItems:"center",gap:6 }}><span style={{ fontSize:13 }}>{career.icon}</span><span style={{ fontSize:12,fontWeight:selectedCareer===career.id?600:400,color:selectedCareer===career.id?career.color:"#374151" }}>{career.name}</span></div><span style={{ fontSize:11,fontWeight:700,color:career.color }}>{pct}%</span></div>
                      <div style={{ width:"100%",height:3,background:"#e5e7eb",borderRadius:2,overflow:"hidden" }}><div style={{ width:`${pct}%`,height:"100%",background:career.color }}/></div>
                    </button>
                  );})}
                </div>
                <div style={{ borderTop:"1px solid #e5e7eb",padding:"10px 12px 12px" }}>
                  <div style={{ fontSize:10,fontWeight:600,color:"#9ca3af",letterSpacing:"0.5px",marginBottom:8 }}>PRÓXIMOS PASSOS</div>
                  {recommendations.length===0?<div style={{ fontSize:12,color:"#047857",fontWeight:500 }}>Parabéns! Tudo concluído 🎉</div>:recommendations.map(d=>(
                    <div key={d.id} onClick={()=>setSelectedDisc(d.id)} style={{ display:"flex",alignItems:"flex-start",gap:6,marginBottom:6,cursor:"pointer" }}>
                      <div style={{ width:5,height:5,borderRadius:"50%",background:areaColors[d.area] || "#94a3b8",flexShrink:0,marginTop:5 }}/>
                      <span style={{ fontSize:11,color:"#374151",lineHeight:1.4 }}>{d.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* MAIN CONTENT DO MAPA */}
              <div style={{ flex:1,overflowY:"auto",padding:"18px 22px" }}>
                {activeView==="semestres"?semesters.map(sem=>{
                  const semDiscs=disciplines.filter(d=>d.semester===sem);
                  const{done,total}=getSemesterProgress(sem);
                  return(
                    <div key={sem} className="fade-in" style={{ marginBottom:26 }}>
                      <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:10 }}>
                        <div style={{ background:done===total?"#dcfce7":"#eff6ff",borderRadius:6,padding:"2px 10px" }}><span style={{ fontSize:12,fontWeight:700,color:done===total?"#047857":"#1d4ed8" }}>{sem}º Semestre</span></div>
                        <span style={{ fontSize:11,color:"#9ca3af" }}>{done}/{total} disciplinas · {semDiscs.reduce((a,d)=>a+d.ch,0)}h</span>
                        {done===total&&<span style={{ fontSize:11,color:"#047857",fontWeight:600 }}>✓ Concluído</span>}
                      </div>
                      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(195px,1fr))",gap:8 }}>
                        {semDiscs.map(disc=><DiscCard key={disc.id} disc={disc} completed={completed} isUnlocked={isUnlocked} toggleCompleted={toggleCompleted} setSelectedDisc={setSelectedDisc} selectedDisc={selectedDisc}/>)}
                      </div>
                    </div>
                  );
                }):(
                  <div>
                    <div style={{ marginBottom:16 }}>
                      <h2 style={{ fontFamily:"'DM Serif Display',serif",fontSize:22,fontWeight:400,color:"#1a1a2e" }}>{activeView==="trilhas"&&selectedCareer?careers.find(c=>c.id===selectedCareer)?.name:activeView==="areas"&&selectedArea?selectedArea:"← Selecione no painel lateral"}</h2>
                      {(selectedArea||selectedCareer)&&<p style={{ fontSize:12,color:"#6b7280",marginTop:2 }}>{filteredDiscs.length} disciplinas · {filteredDiscs.filter(d=>completed.has(d.id)).length} concluídas</p>}
                    </div>
                    {(selectedArea||selectedCareer)&&<div className="fade-in" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(195px,1fr))",gap:8 }}>{filteredDiscs.sort((a,b)=>a.semester-b.semester).map(disc=><DiscCard key={disc.id} disc={disc} completed={completed} isUnlocked={isUnlocked} toggleCompleted={toggleCompleted} setSelectedDisc={setSelectedDisc} selectedDisc={selectedDisc}/>)}</div>}
                  </div>
                )}
              </div>

              {/* DETAIL PANEL DO MAPA */}
              {selectedDiscInfo && (
                <div style={{ width:268, background:"#fff", borderLeft:`1px solid ${T.border}`, padding:18, overflowY:"auto", flexShrink:0 }} className="fade-in">
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                    <div style={{ width:38, height:38, borderRadius:10, background:T.grad1, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff" }}>
                      <Icon.Academic/>
                    </div>
                    <button onClick={()=>setSelectedDisc(null)} style={{ width:28, height:28, borderRadius:7, background:T.bg, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:T.muted }}>
                      <Icon.X/>
                    </button>
                  </div>
                  <div style={{ fontSize:10, fontWeight:700, color:areaColors[selectedDiscInfo.area] || "#9ca3af", letterSpacing:"0.5px", marginBottom:4 }}>{selectedDiscInfo.area.toUpperCase()}</div>
                  <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:15, fontWeight:400, color:T.text, lineHeight:1.4, marginBottom:14 }}>{selectedDiscInfo.name}</h2>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:14 }}>
                    {[["Semestre",`${selectedDiscInfo.semester}º`],["C.H.",selectedDiscInfo.ch>0?`${selectedDiscInfo.ch}h`:"—"],["Status",completed.has(selectedDiscInfo.id)?"✓ Concluída":isUnlocked(selectedDiscInfo)?"Disponível":"Bloqueada"],["Pré-reqs",selectedDiscInfo.prereqs.length||"Nenhum"]].map(([l,v])=>(
                      <div key={l} style={{ background:T.bg, borderRadius:8, padding:"7px 9px" }}>
                        <div style={{ fontSize:9, color:T.subtle, marginBottom:2 }}>{l}</div>
                        <div style={{ fontSize:12, fontWeight:600, color:T.text }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  {selectedDiscInfo.competencies?.length>0 && (
                    <div style={{ marginBottom:14 }}>
                      <div style={{ fontSize:10, fontWeight:700, color:T.subtle, letterSpacing:"0.4px", marginBottom:7 }}>COMPETÊNCIAS</div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                        {selectedDiscInfo.competencies.map(c=>(
                          <span key={c} style={{ fontSize:10, padding:"3px 8px", background:`${T.primary}12`, color:T.primary, borderRadius:5, fontWeight:500 }}>{c}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedDiscInfo.prereqs.length>0 && (
                    <div style={{ marginBottom:14 }}>
                      <div style={{ fontSize:10, fontWeight:700, color:T.subtle, letterSpacing:"0.4px", marginBottom:7 }}>PRÉ-REQUISITOS</div>
                      {selectedDiscInfo.prereqs.map(rId=>{const r=disciplines.find(d=>d.id===rId);const done=completed.has(rId);return(
                        <div key={rId} style={{ display:"flex", alignItems:"center", gap:7, marginBottom:5, cursor:"pointer", padding:"4px 6px", borderRadius:6 }} onClick={()=>setSelectedDisc(rId)}>
                          <div style={{ width:16, height:16, borderRadius:4, background:done?T.primary:T.border, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color:"#fff" }}>{done&&<Icon.Check/>}</div>
                          <span style={{ fontSize:11, color:done?T.text:T.subtle }}>{r?.name}</span>
                        </div>
                      );})}
                    </div>
                  )}
                  <div style={{ marginBottom:14 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:T.subtle, letterSpacing:"0.4px", marginBottom:7 }}>TRILHAS RELACIONADAS</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                      {careers.filter(c=>c.disciplines.includes(selectedDiscInfo.id)).map(c=>(
                        <span key={c.id} style={{ fontSize:10, padding:"3px 9px", background:`${c.color}12`, color:c.color, borderRadius:5, fontWeight:600, cursor:"pointer" }} onClick={()=>setMainView("gap")}>{c.icon} {c.name}</span>
                      ))}
                      {careers.filter(c=>c.disciplines.includes(selectedDiscInfo.id)).length===0 && <span style={{ fontSize:11, color:T.subtle }}>Base geral</span>}
                    </div>
                  </div>
                  <button onClick={()=>{if(isUnlocked(selectedDiscInfo)||completed.has(selectedDiscInfo.id))toggleCompleted(selectedDiscInfo.id);}}
                    disabled={!isUnlocked(selectedDiscInfo)&&!completed.has(selectedDiscInfo.id)}
                    style={{ width:"100%", padding:"9px", borderRadius:8, border:"none", fontSize:12, fontWeight:600,
                      cursor:isUnlocked(selectedDiscInfo)||completed.has(selectedDiscInfo.id)?"pointer":"not-allowed",
                      background:completed.has(selectedDiscInfo.id)?T.bg:isUnlocked(selectedDiscInfo)?T.grad1:T.bg,
                      color:completed.has(selectedDiscInfo.id)?T.muted:isUnlocked(selectedDiscInfo)?"#fff":T.subtle,
                      display:"flex", alignItems:"center", justifyContent:"center", gap:6, fontFamily:"inherit" }}>
                    {completed.has(selectedDiscInfo.id) ? "Desmarcar disciplina" : isUnlocked(selectedDiscInfo) ? <><Icon.Check/> Marcar como concluída</> : <><Icon.Lock/> Bloqueada</>}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
