import React from "react";
import './Home.css';
import IMAGE2 from "../assets/image 3.png";
import IMAGE from "../assets/image 4.png";
import image4 from "../assets/image 4.png";
import image5 from "../assets/image 5.png";
import image1 from "../assets/image 3.png";

export const Home: React.FC = () => {
  return (
    <div className="home">
      <div className="div">
        <div className="overlap">
          <div className="group">
            <div className="overlap-group">
              <div className="rectangle" />

              <div className="ellipse" />
            </div>
          </div>

          <div className="group-2">
            <img className="image" alt="Image" src={image4} />

            <img className="img" alt="Image" src={image5} />
          </div>

          <p className="predict-your">
            <span className="text-wrapper">
              Predict Your Academic Success with <br />
            </span>

            <span className="span">AI-Powered</span>

            <span className="text-wrapper"> Grade Forecasting</span>
          </p>

          <p className="p">
            Transform your study approach with intelligent grade predictions.
            Our advanced AI analyzes your performance patterns to forecast
            future academic outcomes across all subjects.
          </p>

          <div className="group-3">
            <div className="overlap-group-wrapper">
              <div className="div-wrapper">
                <div className="text-wrapper-2">Start Predicting</div>
              </div>
            </div>

            <div className="overlap-wrapper">
              <div className="overlap-2">
                <div className="text-wrapper-3">Watch Demo</div>
              </div>
            </div>
          </div>

          <div className="group-4">
            <div className="group-wrapper">
              <div className="group-5">
                <div className="group-6">
                  <div className="overlap-group-2">
                    <div className="text-wrapper-4">🎯</div>

                    <div className="text-wrapper-5">Accurate Predictions</div>

                    <p className="text-wrapper-6">
                      Get precise grade forecasts based on your current
                      performance and study patterns.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="group-7">
              <div className="group-8">
                <div className="text-wrapper-7">🚀</div>

                <div className="text-wrapper-8">Study Optimization</div>

                <p className="text-wrapper-9">
                  Receive personalized recommendations to maximize your academic
                  potential.
                </p>
              </div>
            </div>

            <div className="group-9">
              <div className="group-10">
                <div className="text-wrapper-10">📊</div>

                <div className="text-wrapper-11">Performance Analytics</div>

                <p className="text-wrapper-12">
                  Detailed insights into your academic strengths and areas for
                  improvement.
                </p>
              </div>
            </div>
          </div>

          <div className="text-wrapper-13">How It Works</div>

          <p className="text-wrapper-14">
            Simple steps to unlock your academic potential with AI-powered grade
            predictions
          </p>

          <div className="rectangle-2" />

          <div className="text-wrapper-15">1</div>

          <div className="text-wrapper-16">Input Your Data</div>

          <p className="text-wrapper-17">
            Enter your current grades, assignment scores, and study habits into
            our secure platform.
          </p>

          <div className="rectangle-3" />

          <div className="text-wrapper-18">2</div>

          <div className="text-wrapper-19">AI Analysis</div>

          <p className="text-wrapper-20">
            Our advanced algorithms analyze patterns in your academic
            performance and learning behavior.
          </p>

          <div className="rectangle-4" />

          <div className="text-wrapper-21">3</div>

          <div className="text-wrapper-22">Get Predictions</div>

          <p className="text-wrapper-23">
            Receive detailed grade forecasts and probability ranges for your
            upcoming assessments.
          </p>

          <div className="rectangle-5" />

          <div className="text-wrapper-24">4</div>

          <div className="text-wrapper-25">Optimize Performance</div>

          <p className="text-wrapper-26">
            Use insights and recommendations to improve your study strategy and
            achieve better results.
          </p>
        </div>

        <div className="text-wrapper-27">What Students Say</div>

        <p className="text-wrapper-28">
          Discover how ScorePredict has transformed academic planning for
          thousands of students
        </p>

        <div className="overlap-3">
          <img className="IMAGE" alt="Image" src={IMAGE} />

          <div className="text-wrapper-29">Jessica Smith</div>

          <div className="text-wrapper-30">Computer Science Major</div>

          <div className="overlap-4">
            <p className="scorepredict-helped">
              &#34;ScorePredict helped me identify which subjects needed more
              attention. The predictions were incredibly accurate and helped me
              plan my study schedule effectively.&#34;
            </p>

            <div className="text-wrapper-31">★★★★★</div>
          </div>
        </div>

        <div className="overlap-5">
          <img className="IMAGE" alt="Image" src={image1} />

          <div className="text-wrapper-29">Michael Johnson</div>

          <div className="text-wrapper-30">Business Administration</div>

          <p className="the-AI-predictions">
            &#34;The AI predictions gave me confidence in my academic planning.
            I could see exactly what grades I needed to achieve my target
            GPA.&#34;
          </p>

          <div className="text-wrapper-32">★★★★★</div>
        </div>

        <div className="overlap-6">
          <img className="IMAGE" alt="Image" src={IMAGE2} />

          <div className="text-wrapper-29">Emily Lee</div>

          <div className="text-wrapper-30">Psychology Student</div>

          <p className="amazing-tool-it">
            &#34;Amazing tool! It predicted my final grades with 95% accuracy.
            The study recommendations were spot-on and really helped improve my
            performance.&#34;
          </p>

          <div className="text-wrapper-32">★★★★★</div>
        </div>
      </div>
    </div>
  );
};
