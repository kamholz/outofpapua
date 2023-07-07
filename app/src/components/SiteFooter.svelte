<hr>
<footer>
  <a href="https://outofpapua.com">
    <img src="/logo.png" alt="OUTOFPAPUA logo">
  </a>
  <div>
    <img src="/cc-by-nc.png" alt="CC-BY-NC">
    <span>
      OUTOFPAPUA database edited by David Kamholz and Antoinette Schapper is licensed under <a href="https://creativecommons.org/licenses/by-nc/4.0/">Creative Commons Attribution-NonCommercial 4.0 International License</a>.
    </span>
  </div>
  <div></div>
</footer>

<style lang="scss">
  hr {
    background-color: gray;
    height: 1px;
    border: 0;
    margin-block: 60px 14px;
  }

  footer {
    font-size: 13px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    > a {
      align-self: flex-start;
      > img {
        width: 50px;
      }
    }

    > :nth-child(2) {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 10px;
      width: 550px;
      max-width: 75%;

      > img {
        width: 90px;
      }

      > span {
        line-height: 1.4;
      }
    }
  }
</style>