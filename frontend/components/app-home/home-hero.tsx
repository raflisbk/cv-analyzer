import Image from "next/image";
import { usePathy } from "@/components/pathy/pathy-context";
import { pathyPoseSrc, type PathyPose } from "@/lib/pathy/pose";
import styles from "./home.module.css";

const quips: [PathyPose, string][] = [
  ["idea", "Try Match it to a job."],
  ["proud", "I read CVs for breakfast."],
  ["surprised", "No numbers in your bullets?"],
  ["love", "Click me again, I like it."],
];

export default function HomeHero() {
  const pathy = usePathy();
  return (
    <>
      <section className={styles.hero}>
        <h1>
          {["Ask", "anything", "about", "your", "CV"].map((word, index) => (
            <span key={word} style={{ animationDelay: `${index * 80}ms` }}>
              {word}
            </span>
          ))}
        </h1>
        <button
          className={styles.heroPathy}
          aria-label="Say hello to Pathy"
          onClick={() => {
            const [pose, text] =
              quips[Math.floor(Math.random() * quips.length)];
            pathy.react(pose, text);
          }}
        >
          <Image
            src={pathyPoseSrc("hello")}
            alt=""
            width={170}
            height={170}
            unoptimized
          />
        </button>
      </section>
      <p className={styles.note}>ask it. fix it. land it.</p>
    </>
  );
}
