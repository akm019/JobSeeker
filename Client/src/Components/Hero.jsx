import React, { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import GetStared from './GetStared';
import icon from '../assets/icon.jpeg';
import { Search, MapPin, Building, ArrowRight, Sparkles, BookOpen, MessageCircle, Target } from 'lucide-react';
import axios from 'axios';
import { AnimatedTestimonials } from './Testimonial.jsx';
import ChatHero from './Chats/ChatHero.jsx';
import ResumeAnalyzerHero from './ResumeAnalyzerHero.jsx';
import AIQuizHero from './AIQuizHero.jsx';
import { toast } from 'react-hot-toast';


const testimonials = [
  {
  name: "Sarah Johnson",
  role: "Software Engineer",
  image: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAJQA6AMBIgACEQEDEQH/xAAbAAACAgMBAAAAAAAAAAAAAAAEBQMGAAIHAf/EAD8QAAIBAwMCAwQHBwMCBwAAAAECAwAEEQUSIQYxE0FRFCJhcSMyQoGRobEHFTNSwdHwFiRyNGJDU2OCwuHx/8QAGgEAAwEBAQEAAAAAAAAAAAAAAgMEAQAFBv/EACQRAAICAgICAwEBAQEAAAAAAAABAhEDIRIxBEETMlEiYXEU/9oADAMBAAIRAxEAPwCHXZrSOyhTYMZwasGn3mnizh442+lVPqKLFohx50fpcebGL5VE5PiVKCstC3un/L7qz22wJ7Z+6k6RfCpBCM9qDnIL44jhbyx/lH4UFrF3aCBTt4+VRxxZ8hQmtxgW44olJguER1pl3Ztaqdv5UwjubQ9lH4VWtLAFohxTONeMit5Mzght7Rafyj8Kz2u1Q5UAEfClRU1G4NEpsH40wjX9ajEAQHO4Yr2xu09iTkdqruvDESkd80Vpx/2SGhk+Q3GlB6DJ5AzMaU3oVzzRzeeKBuV4pbGWLpI0x2pRcxt7V7qkjI8qcSlI8rLIqkDcQSM4HeqeepLia4c2URdCcL7ucehoowsCcvwa6xFJJFlY2PBPHPFIpdJu5CNkTMp8xTO3n1OBoTfw+JFKMuVTBBPlUH7wninBSYrtPukZyDnz/wDqmwlxVICceT5MBj064sv9wV4xxRP+pZvD8MZ4+NWi1l/esDW1yEWSRSQABgv6j4GkWmdHTSXMvtH1MkqVodS+wLuP1Y76JvH1HGcljmrJqFubeT3vMZFI+j7RNI1YWxIxhjz5U165uTFGkkTDhTU0mrNlhU1/p5GqyxlG5zwM+VVDqDQdkzMvAPfFF9O68txEBMcODg1N1NqsRt/cIyODXVJOiKnZRIrVob0oe4NS3u5HxRToXkWbsO9R6goIBUZ86Jy/pWDI0gi8SPOea9jt2E+WFQ2iSCTkkD0p2qKsQYjmik+JyQuvYnmIVRgYrK3u5iMhRWVik2tG2XPqIf7Nf+VH6MM2MdD6+0LWICspOfWi9CliNgm514+NOa0X8tjFF4qQLXqSwAfXX8a3E9vn66/jWKITlo2iWl2vjEC/OmiXUA+2v40n6huLdoOHHf1reIpyom07iyUntTW2dTHxzSKwu4PYQC4yKOtbyBVP0ldQSY0JHoKgm+FDnUbcA/SZ+6oH1O3/AJ/yrAkB69/AX51NprZsUpdrt/AYFO7zrfS9St/Y1G/8q6jeSsbGgrsqoG7juc+leHUYCcKxLHtSrXS1xDkOVhzzjgtQ0FZUb9d1/czCQh+AGPOSRwPgK6V0B0jZ6ZZx3NxGst1Jgs5Ue78q5RI3s2oPExyZJFPfnHlXdLfUVtbSOKOCW4lCA+HCMkD1PpXTb0gsaVNjm7tYZYDGY1KkEDIrmXU3S1xbiSTTxmNuSAKutrr9zdTmCbS5bQ4wpdw24/dS/qLUZ0lFql1FZoB9JJIucfKsbXoYv9OU6Tqg0bUUN6rrgkAY8/IVb9A1bxZo5WUCG6l2qcZIqu9WWVlOBJDfyXLLIN27HPywKJ6bmWO23nDRRuChP2WAI/qaPuJPOOx1rdrJa6zJJCx3kZAFVXWtcuZt0NwPqjHNWCe8lvfAugGYspiYKPMHj+lKNZsBIrM8eDjzHOalep7BlqNxexf0haRzGZ5Gw6niteoE/wB28QfKYzigYDPZsxgbbnvQ0tzIZi8nJPeqoyt2Tc4uIxsPft/DbkrxzWMMrj+WhbW7CSqMfW4ow8sWA+t3oMkLdipHtrF4xyOMUfJ7qbfSlQuTBuCcGippj7OsvmaVkUpA3YHedzXtFQQ+0cgFmPkK8oVOlR1MsWq2Eg07c0gr3SbSZrRdsoAFF6u27TmAqHRJCbTHoa9CtFlbGNtp00h5no0aO3nNWWJIcc01ZwAMfrXUaLBpLD/xKX61pQW2P0measm4bc0m1tmNsdvPNC2gJCrTdJZrUkycZpxa6SvhYMlB6XcH2UqaOguioOKVztnRkefumMn+IcVq+jRfzmiY5j9qtnlz2NamNT/Cv6zpcSWxO8motO0+L2Ue+aN1xibVvnUWjDxLMjODmt9HLs39hgjUyO7YUbjzjikGoTS3qzLZFpDbRFtg7DFWHUo2WwlFqR42VALcgjIz+VVnUG/dhdEykbk79vLP8PzoLGoQOgudWhkY/WmA+XNdwGmz3lqixXTW8eBvEXDP8ya4PbyGW7R4I2QJIG253Ec/3ruWk6svsELkMA6BmNDl00Nwq0w3TtEFkzTyO8r+RllLkH5n+le6hBEt+slwFKyp381PzoOHWY7t5ZZL3wIxlIVHJYjucedJrqC6uJhOovbyJPqsE2Lz6k13fQyq7D9c02wn06URnIYY3ltx/GuQvqDC9eC4JMMMmxwD72PUGr9bTPqMl54cEtvFASsqlgQWHoRXO9XjWPqK5VcY43E+XFHiW3YnP0qL1pFwtvZi10+zMsalnR8qOScgk/h+FF3kTewvJebWcjLHtz6Uk0W/EaxpDiGVtviwBCeR9pcev9qb6hK8umO0sfhkAgA8ZHrg9vOp81qSBxxjJO0VmGOC/ZigOF9BSvUdPZXKqpPmOKvvSulwGx3495gc4FNF0a3DEyLnPqKW8yjKkJfiPjaOTafYtI2XBBHbNOmtNkPlkU/6ns4bFS8ahQT3ApLG5eM7jk1XGXKNkuSDhoXvZiVc9qKkto/ZQrsOMVDNI0DFT2zUlzbvcrGEPBFLYHol6fvrazumabG0GspZNp81rI6n8xXlckcmN7nWhLZMua80LVQFMfGc0nsYxIwRuxPNZPCtndoyHv3r0+IfJnQIb0IobHJqeG/Mjj0qmrqg2AZpjY6iq8nH30ElrQLnItst7sXAHehru4D2j5FJG1RZrhF7+vwprdtEdPYoecUiONrsQ5z9iu0uSkcm0Z5oiwvi8uGWlVhMcybxxn8amjI8YFQRS5RUXY1N0WZnLgEDFYucYoSKZVjGa3FyPKiSLMfRFrCg2hzQ+jH6Aj415q9z/tT8610F8w9+S2OfKt9B+w28kjt4ULDfhhxnvVX1AzNAyOyMq7sAn3hnyp1cOHd43DMWGFbHOAQTj4YpBq0uGVlYMNvOB2b0paGeiuxJPaxvcxHaVI25A57kfpXRP2edQLf6a1nesDcwHkH7QPY1Q/Zy6ssjlE+z2OSKm6fha11VFhdmWRdu9B9U+VHNKUDMcnGWjslp0/ZS3H7xtd0V1jGUwfyOcfMUbe2t9dwmBmYw4wckYH3VUrLUtVsSq71fbxnHf50xn1/VbiLaPBT4nJNJhkpUVPsA6juIenNFmRtoLknap5Y5z+Zrj4uJri7kunwXd8sM8HPlTzry/uLm9RLmYuVUnOMc/Kk+neEHw/BPGG7E/PyP96phHjGyLLPlKi0aKZree2lticONo3jcUGeR+pH3VZb9mn0/M+1ZHHvBTnn1/wA9a06ZsQLdLiC1klVjt2mRfo2zyOT59xSbX5Ly3k8E4wGOSo4HNTzjzYSycEXfpWDw7Fc8jypzcR5jyO9V/pe/jSwjWRwMDmrD46yxnaQRUEovmylSi49lQ6saOS1eJ8bvKqnYkABSeScVYeswcMy8Y71UEkYHK9+4NXYXUDzPI+wZrkP0Ade4FR6dM7mDGaIu38ayJPpmpdHijZYhnkEV12Tk3U+YY1fHJxWVaLnT7a5mg9oI2hexrK2CtGnMraTbz6VlxN47D4Vo6lF+FQocMa9QJE8K5emajCDFK43w1HxTqQBmhZ2jb3gwZTgimUF7M9uUY5oAlPWibMqYzg0No3iMtNtpJEdgpJPlivMNbyHehzRmh3qrIY8DGKY3otwm5gN1S5ErKoeOpRsUCVnGVBrZJGH1qZxPa7cqBQlyUydqj5CjbSRqiwO/kzbPU3T5BQjI+tjHw9aX35fwX4rTSp9isM4rNSRm0xxJGyvOzS7sMRtA4bk8Zqs6hdrkB7Z4MnCe8CMkd8f3p7dStPEhiOGGc84BpEkEcglZ92zIwu7zOc/LyroYnJ0Zl8iOONsWxzCNi7qpA4ILY3H4gVslzFNK6W8rQyL76qh8/hXtxCjZ2jHwpTdWxRg6cNngjypzwUIh5ds6n0zq7arYDJWS4iYJMNm0j40wu41jVuD2qsfs/WNYXlib3nx4i55zVkvC8tw0Iz2z91QyVSaPTi7SZzLqGNJdcfxG4REbH3kmhra0a5mmeLJPfaRjkf8A5W2v7pNcvSDgNIq/IAAf0pnaKClvDFhfCIdgp5wfrc1Rf8kj1LY50q+k0+yDKuxgu2ZCOHB/z8q0vrlricG4YszA9++PIn48VvYvFN4ZvZgqSHDbhyoH1ePwr3UdAuZWSVZclUxwMA4/wUh10dkg5R0DeMY4x4chHyozR+opbNwk7Flz3JpFLaXsRKhdwFRLDOzYaNhQOLTJHCcSzdR3aXkLSIR73xquWe1/mDW11b3EVvnJK0HYSlZP1p8VaMtvsfadAJg0PpkYrWLTri1ud2TwwNFaKM6hG/2T3p11BD4SrInAwKmbqVGUaalBPKsYicqR3IrKmt5ifBZvPBrKfBKjip3WgzCFjtbihtN0KS5zhWNWe410SQOu3uPShtAv5Bv2KcZpqyZHHRZ8eNPbAP8AS8v8rVuOmJhyBVje+u+yQux+ArQT6q3aymP/ALaBzzhqGD9BdF6Mlv5VRjgn9Ke3H7PvYoyIpGzTboR79tSK3drJGmzgstX2/i3p27fCqcak4/0T5OKl/Jx+z6UvoJiUAcYqW86c1GbAMRA+ddLVFQ9qmUJ5qK2WFM2GeUTmlt0zdLHtMBJ+dHW/Sl1IeY1QfE10MbBj3RUquoHYYoP/ADx9m/O36OfXHQjywtulxx5CqnNog02aSGdwR5GuvalfiJGC9+1cs6pstS1K+D2uPkaGeLVRNhkp3IrHUEqWECRQtmWdscH7I5P49qUXVxKltIsJxsYKxwCWYgkn8qy4V5NeWB23+yjDnyJBz+oFe2aCW2uCf/OU/dgiqMacVRBnkpSsFkaRSp3blYZBx2FQyyZViwwR3FS2wZmiXdgNGB+R/vQt0NkjDyZyn58UdgUrCtE1GfT7qOa1lw6579nAPYj5YrpejapbaxJDdQ/RuymOWI90fyrkUZ2Khx7yOfwxTq2uZ7WWO6tZGR8ZUg+Xoany4VkWuyvD5DxSp9DjqLp5vaPEh4d87s9j/nNV2OeK1Y5crIQCj4ztPmD6j4U1vdb1K7hH0ylmz7wQAkf5mq3cR8fSfMMf60EISS2Pnlxz+o0sNekgvlcZZX4JH2fkD+ldBsNWhvLEywAPlfewexrl+n2yvOmTtY8A4zk086dujpOoL43/AEk7EHH2fX/PhQ5cMZx12DDK4ST9FpiuoWdt8JNEMbQx5WEZ+NWH/TvhjxAgeNxlWHYion02EKR4favMqUJ7PRTjKJRNUuVw0RQKDSOOLEmVqxdU2yRRuQuMVXtNmDnB8q9CF8bPMzRqWiy9P4eRA3cHFPuogf3Wr+YGKr2iyLHqCjyNWnXtr6cdvPGanl9rFXor8VxItvAQOQKygZL6eGOPEfuj4V7T4vRwJdyFAQo4q0/s0sV1G7ZXHug5IqoSS54q7fseuBFrskJ+1HmvRjFLoFybWzq66PaxRjaigAeQqBltYnAwtMNUmNvaM49Kpk17JcksvlWWbJbot1r4O8FQMjzoucjw6otprTW06LKxxmrQmoJPFwwrUrNbo0mA3V4DUUsvNeCTNbRlhQavHkwp5qDxK0lf3TWM2xZqUhd+9IL6/NlbzzFR9GhYfPHFOrrkk/Gqd1m/hae65wZDzj+Ucmp39hnJKDbOfaXuN3eTtyXYrk/j+uKn0wf7O59MofzND2Z2xW+ft72x+I/pRenf9Lcj1Vf1qggfsXoMG3YeTFD+YoLUDi4kX45/SjGO0Sj+SbP44NCapxcFvVRWMOPYNbnMrZ597P4mndmQkbRfetI7X65b1Ipr2jB8xXI3IrN0YGURkDC5xj4msaISrkgHBNCvI8c4cDgjFFxPiLBraQNu7B1iWFXlt25UZAYZ2H76DeR5S0kkhbnj4ZNGOw5kH1t3PyoLYA4iI4U7j8fSgURvPkdo/Zz1X7d0xLZ3xDXFk21T2zEeV/Dt8gKOS6WdnI4Fca0e+k06/W4izjOHQfaXtXUbeZRAkkTB0YblI8x61L5aVWyrxZXoSdYIvgSefeufWkwjnx6mrp1TJczRuEjY57YqjLp2obw3gng0Pjzi4Uw88HZZrOQx3EMucg8Vcnl8awXcc+7VJsbW7dUDx4xVx8Ipp5B+t5UidXoTwlXQPqEUX7pUgDOAK9oe9kZdOVCueRWUcFoxxkU9FlZ84NWf9nFw9v1ZaE9nypqYWdusbYAzio+mmjg1eOQcGOUHNetwom52jvWqR+LYuPhVPsYlUOCOxNXQkS2X/JarMMOJZQB50CHMpXVLmAF0OMV7oevSCNRI1S9UQrOTGeOaW2Om7VAGeKQ5OMtD4xTjsuEOqrIOT+dGR3YYcVVWjeztjKqZwPSvND6pjluxBdJ4ZPAJHBp8G2JmlHouaTE17OX8LcBkCiITC6BlwQRxQF3qaWd7HG/8OTgnyFZlT46Mg1ewCSXcePWuf/tHvNsiW4PaLn5sf7L+ddL1G0APtFuMq3fFcT66vDc63ddyqvsA+QxUPjyn8j5D/JUeCUQGLKxWh/7P/kaNtABHIP8AsoB8rb2nYHwh+pNGsu6F0HG8EcVcQPoV3T5uJoweJFDA/fij7fRP3zpftNpcA3iMVa1bjIHYg+p54qXQOnr3qF/Es3t0S392Z5pQuPkO5q0ab0Ra2V57U/UAjlXukUY2/HueaTlyJeyvx8Lk7a0c4gtpFnMM0bI8b4ZWGCDTV1AjCinfWljLDdR6io8VJAEklXyI7E/Mf0pD4oCZJ5pmOXKNis+Nwm0wa9XBjPxqZVLhAKHml8VgPQ0fbEKMnt60YlmpgAQ5NCWdjcX+qLbWUZllYcc4C48yfIUTJex7m94bQO9Wbo2ynjEggTZeXg3FyP4MQ8z/AEHrSss+KKPFwvJOn0IbvRruz1CTT1jNzcRbd3swLjtmn/QWol/a9Lm5MLeJFnyU9x92fzq0Lbrb2stro0jRLy15qL8nPz8z6DsAPlmkdHxIvVkgt5mmgMbBZGXBdR9o/lU+SXyY2mUvD8GRNPTL1LbxsOUB+dCNZxKciNfwpmY8ZFRlR515RcLxEqdlFayliuM0cUDGoniFZRjSF7RhxhhkVlFMmKyiTaBpCDbNsPOeKB0pZTdy7frZ4q8HTV8NvdHakei2itqs6DyNfU8Nngqejs3Tk/teiW0hOSYwDSG8uHtNQkXB2k5ozo6YJavbE4KHKg+lR64qi5Z+KS41JoepcoplZvbV7m5LkcE5o+1tUTuKk8RdvNYJkH2hQcVdjOTqjeaBJLd0wORXLNdiktLpgmQVOVI8q6gbiPtuFVHqqyWeTfEAcjnFHH8Fy/Qzo7qlbu3WC6cLMoxnPeitenSSWMM4yTxg1zqTThGpeGRopvIjikN7rOqRTBZpizRnjJ7isbpmpckdy0fVvZiLa7fKHhSTXEtSD3+qzBDzLcPg+g3H+lDS9RahdTIGmKjcOzVNDN4XtM32tpVD8W7ml8VytGSbSphN8ytDG8YwgXavyBIH5CpY5PoYnzjgUIg36LE3mu5cfef71vp8m+zC+hIrRVEtjpupXuotZ6TFO8jEsfCYqAp/mPpmrbYdGW9htuuotbKMnPhQSHOfi5/oPvqqx395Yu3sF09vK67cqcBh6NTXSOnDqFsur9T6itvZsu4J4oaWQeZzn3R+fypORey3xpJ69nQNLbTdRt/Z7WMzwyKUbncCOxrlvWHTlxoF3MYVZ7Tdwe5j+B+Hxqyy9eaZpQW06fsQlmvcou0AebepPnmnEd+NRh9pkdZFk4wec0hOUP8AhdOMMqr2ccSULOMtkGp7m5cxrbxtgn65rrU3ROh3ERuY7SKOQYYiPgfh2FUmLp+O3nvIrtFISAyI6gYbHOGx9UkfgafDKpaIsvjOGyvaZbtd3sVpEfd3Au3wzzXXtNtI7SxluJ5vZ0cAzSZ5wPIGue6fElrGZbD3NxzvUZI/Edx6Ur1a/urvKXM01y4bJzIcL6cDityYXJ7Z2DyYwWls6HqPUWmPbSR/RSQRL9BYqf4pPm/w+HnXPl1bUNOvEu7UQQtuPCDgZ7jHpUIhhWPxE3EOPrbs7TUUk/ixFZvfI7Zoo41FUKyZ5ZJW/R1jpXW313SzczQCGZH2OqngnA5Hzz2psw47VVP2cxOmjS3BBCTynaC2QdvBI9Of0q1lga8fMlGbSPRxNuKbIZF9DioWBqeSh3z60oYROaytXr2tMHXiEKeB2quaG2NbuOB3zWVlfVnziLQl7NauJYSA3b51VuqeotQ9qKh1A+ArKygyB42V06/qOD9N+VAv1HqW8/Sj8KyspSHg8nUepEfxh+FMNF1O7upT48pasrK1GSJprmTxWU4I+Iqva/EpAfHvV5WVkjYdiKEDx4/+VM25tMf+of0FZWUsOZJp7H2Z0P1cnj7hW2lMfClGexFZWVzFMku+YxmhZR49tKzk7oxuBHn86ysoQogMUjvLHGWIWRgrAehqx9NajcRahNaqw8FeVU/Z+VZWUE1ooxOpaLpc6lcQ6Jc3Skb442IB7dvOqUJpE0a5uQ58W4uxFISe6hS/6gfcKyspONbKM7fETXHvSNkn3jyAeDXmfBiPh+7njisrKqPPRFISkhRSQjLuK+Wa8j54PmeaysrmH6R2bRYkt9FsYYhhFgXH4UUSR2rKyvCn9merHo1LGopgFbisrKFGg0nfFZWVlEcf/9k=",
  rating: 5,
  designation: "Senior Developer",
  quote: "Found my dream job through JobSeeker. The platform's AI-powered matching system is exceptional!"
  },
  {
  name: "Mike Chen",
  role: "Data Scientist",
  designation: "Senior Developer",
  image: "data:image/jpeg;base64,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",
  
  
  rating: 5,
  quote: "The career guidance and mentorship programs helped me transition into tech smoothly."
  },
  {
  name: "Emma Davis",
  designation: "UX Designer",
  image: "data:image/jpeg;base64,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",
  rating: 4,
  quote: "Great community of professionals. The mock interviews really prepared me for the real thing."
  }
  ];

const Hero = () => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Fetch jobs and handle search functionality (same as before)
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get('https://jobseeker-1-1buy.onrender.com/api/JobPost');
        setJobs(response.data);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = jobs.filter(job => {
        const searchTerm = searchQuery.toLowerCase();
        return (
          job.positionTitle.toLowerCase().includes(searchTerm) ||
          job.industry.toLowerCase().includes(searchTerm) ||
          job.description.toLowerCase().includes(searchTerm) ||
          job.companyName.toLowerCase().includes(searchTerm) ||
          job.location.toLowerCase().includes(searchTerm)
        );
      });
      setFilteredJobs(filtered);
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  }, [searchQuery, jobs]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login or signup to access this page', {
        duration: 3000,
        position: 'top-center',
      })
    }
    else{
      e.preventDefault();
    navigate(`/JobFind?query=${encodeURIComponent(searchQuery)}`);
    }
    
  };

  const handleJobClick = (jobId) => {
    if (!user) {
      toast.error('Please login or signup to access this page', {
        duration: 3000,
        position: 'top-center',
      })
    }
    else{
      navigate(`/JobFind?selected=${jobId}`);
    }
   
  };

  const handleGetStarted = () => {
    if (!user) {
      toast.error('Please login or signup to access this page', {
        duration: 3000,
        position: 'top-center',
      });
      navigate('/');
    } else if (user.role === 'jobSeeker') {
      navigate('/JobFind');
    } else {
      setShowModal(true);
    }
  };



  const handleClick = () => {
    if (!user) {
      toast.error('Please login or signup to access this page', {
        duration: 3000,
        position: 'top-center',
      });
    } 
    else {
      navigate('/JobFind');
    } 
  };
  const handleCardClick = (e, link) => {
    if (!user) {
      e.preventDefault();
      toast.error('Please signup/login to access this feature', {
        duration: 3000,
        position: 'top-center',
      });
      return;
    }
  };


  const handleProfileEdit = () => {
    if (!user) {
      toast.error('Please login or signup to access this page', {
        duration: 3000,
        position: 'top-center',
      });;
      navigate('/');
    } 
    else {
      navigate('/ProfileEdit');
    } 
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6
      }
    }
  };

  const profileCardVariants = {
    hidden: { x: -100, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const searchBarVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020B2D] to-[#051140]">
      {/* Hero Header */}
      <motion.div
  initial="hidden"
  animate="visible"
  variants={containerVariants}
  className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-20 max-w-7xl mx-auto"
>
  <motion.h1 
    variants={itemVariants}
    className="flex flex-col items-center text-center space-y-2"
  >
    <span className="text-4xl md:text-6xl font-bold text-white tracking-tight">
      Make Your <span className='text-cyan-400'>Dreams</span> come true
    </span>
   
    <span className="text-4xl md:text-6xl font-bold text-white tracking-tight">
      with
    </span>
    <span className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-500 to-purple-600 bg-clip-text text-transparent">
      JobSeeker
    </span>
  </motion.h1>
  
  <motion.p 
    variants={itemVariants}
    className="text-gray-300 max-w-2xl mx-auto mt-8 mb-12 text-xl md:text-2xl text-center leading-relaxed"
  >
    Discover your perfect career path with JobSeeker's AI-powered tools
    and join our community of successful professionals.
  </motion.p>

  <motion.button
    variants={itemVariants}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={handleGetStarted}
    className="group relative inline-flex items-center justify-center px-10 py-4 text-lg font-semibold text-white bg-[#4361EE] rounded-full overflow-hidden shadow-lg hover:shadow-[#4361EE]/50 transition-all duration-300"
  >
    <span className="relative ">Get Started</span>
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400"
      initial={{ x: "100%" }}
      whileHover={{ x: 0 }}
      transition={{ duration: 0.3 }}
    />
  </motion.button>
</motion.div>


      {/* Search Section */}
      <motion.div
        variants={searchBarVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto px-4 mb-16"
      >
        <form onSubmit={handleSearch} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 border-b border-white/20 pb-2">
                <Search className="text-white/60" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for jobs, skills, or companies"
                  className="w-full bg-transparent outline-none text-white placeholder-white/60"
                />
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <button
                type="submit"
                className="w-full md:w-auto px-6 py-3 bg-[#4361EE] text-white rounded-xl hover:bg-[#3651D4] transition-colors flex items-center justify-center gap-2"
              >
                <span>Search Jobs</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </form>

        {/* Search Results Dropdown */}
        {showSearchResults && filteredJobs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute w-full max-w-4xl bg-white/10 backdrop-blur-lg mt-2 rounded-xl shadow-lg z-30 max-h-96 overflow-y-auto border border-white/20"
          >
            {filteredJobs.map((job) => (
              <motion.div
                key={job._id}
                whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                onClick={() => handleJobClick(job._id)}
                className="p-4 cursor-pointer border-b border-white/10 last:border-b-0"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-white">{job.positionTitle}</h3>
                    <p className="text-white/60">{job.companyName}</p>
                    <div className="flex items-center gap-2 mt-1 text-white/60 text-sm">
                      <MapPin size={16} />
                      <span>{job.location}</span>
                      <span className="mx-2">•</span>
                      <span>{job.salary}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 mb-16 ">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Profile Card */}
          <motion.div
            variants={profileCardVariants}
            initial="hidden"
            animate="visible"
            className="lg:w-1/4"
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex flex-col items-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative"
                >
                  <img 
                    src={user?.picture || icon} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full border-4 border-[#4361EE]" 
                  />
                  <motion.div
                    className="absolute -bottom-2 -right-2 bg-[#4361EE] rounded-full p-2"
                    whileHover={{ scale: 1.1 }}
                  >
                    <Sparkles size={16} className="text-white" />
                  </motion.div>
                </motion.div>

                <h3 className="text-2xl font-bold mt-4 mb-6 text-white">
                  {user?.name || "Welcome"}
                </h3>
                
                <div className="w-full space-y-4 text-white/60">
                  <p><span className="text-white">Email:</span> {user?.email || "Sign in to view"}</p>
                  <p><span className="text-white">Skills:</span> {user?.skills?.join(", ") || "Add your skills"}</p>
                </div>

               
                  <motion.button
                  onClick={handleProfileEdit}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-6 py-3 bg-[#4361EE] text-white rounded-xl hover:bg-[#3651D4] transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Edit Profile</span>
                    <ArrowRight size={18} />
                  </motion.button>
                
              </div>
            </div>
          </motion.div>

          {/* Quick Access Cards */}
  

  
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex-1 grid md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {[
        {
          title: "Learn & Grow",
          description: "Get industry ready with our courses",
          icon: <BookOpen className="text-[#4361EE]" />,
          link: "/Courses",
          color: "from-blue-500/20 to-purple-500/20"
        },
        {
          title: "Expert Connect",
          description: "Chat with industry professionals",
          icon: <MessageCircle className="text-[#4361EE]" />,
          link: "/ChatRooms",
          color: "from-green-500/20 to-blue-500/20"
        },
        {
          title: "Practice Quizes",
          description: "Prepare with mock quizes",
          icon: <Target className="text-[#4361EE]" />,
          link: "/AIQuiz",
          color: "from-purple-500/20 to-pink-500/20"
        }
      ].map((card, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          whileHover={{ y: -5 }}
          className={`bg-gradient-to-br ${card.color} backdrop-blur-lg rounded-2xl p-6 border border-white/20`}
        >
          <div className="bg-white/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
            {card.icon}
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{card.title}</h3>
          <p className="text-white/60 mb-4">{card.description}</p>
          <Link to={card.link} onClick={(e) => handleCardClick(e, card.link)}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2 bg-[#4361EE] text-white rounded-xl hover:bg-[#3651D4] transition-colors flex items-center gap-2"
            >
              <span>Explore</span>
              <ArrowRight size={16} />
            </motion.button>
          </Link>
        </motion.div>
      ))}
          </motion.div>
        </div>
      </div>
___
      {/* Testimonials and Chat Hero */}
      
      <ChatHero />
      <ResumeAnalyzerHero/>
      <AIQuizHero/>
      <AnimatedTestimonials testimonials={testimonials} />
      {showModal && <GetStared onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default Hero;